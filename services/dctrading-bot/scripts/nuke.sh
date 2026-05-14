#!/bin/bash
# Nuke all trading state: Turso tables, local + remote checkpoint, Alpaca positions.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

CLOUD_TARGET="${CLOUD_TARGET:-oci}"

AWS_REGION="${AWS_REGION:-ap-northeast-1}"
AWS_INSTANCE_ID="${AWS_INSTANCE_ID:-}"
AWS_SSH_USER="${AWS_SSH_USER:-ec2-user}"
AWS_SSH_KEY="${AWS_SSH_KEY:-}"
AWS_REMOTE_DIR="${AWS_REMOTE_DIR:-.}"
AWS_SERVICE_NAME="${AWS_SERVICE_NAME:-dctrading}"
export AWS_PROFILE="${AWS_PROFILE:-AdministratorAccess-118740508718}"

if [ "$CLOUD_TARGET" = "aws" ] && ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "AWS SSO token expired or invalid. Launching login..."
    aws sso login --profile "$AWS_PROFILE"
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        echo "AWS authentication failed after login." >&2
        exit 1
    fi
fi

GCP_ZONE="${GCP_ZONE:-asia-northeast1-b}"
GCP_INSTANCE="${GCP_INSTANCE:-dctrading-asia}"
GCP_REMOTE_DIR="${GCP_REMOTE_DIR:-.}"
GCP_SERVICE_NAME="${GCP_SERVICE_NAME:-dctrading}"

OCI_SSH_HOST="${OCI_SSH_HOST:-}"
OCI_SSH_USER="${OCI_SSH_USER:-ubuntu}"
OCI_SSH_KEY="${OCI_SSH_KEY:-}"
OCI_REMOTE_DIR="${OCI_REMOTE_DIR:-.}"
OCI_SERVICE_NAME="${OCI_SERVICE_NAME:-dctrading}"
OCI_INSTANCE_OCID="${OCI_INSTANCE_OCID:-}"

source "$PROJECT_DIR/.env"

TURSO_HOST=$(echo "$TURSO_URL" | sed 's|libsql://||; s|https://||')

ssh_opts=(-o StrictHostKeyChecking=accept-new)
if [ -n "$AWS_SSH_KEY" ]; then
    ssh_opts+=(-i "$AWS_SSH_KEY")
fi

oci_ssh_opts=(-o StrictHostKeyChecking=accept-new)
if [ -n "$OCI_SSH_KEY" ]; then
    oci_ssh_opts+=(-i "$OCI_SSH_KEY")
fi

aws_host() {
    if [ -n "${AWS_SSH_HOST:-}" ]; then
        printf "%s\n" "$AWS_SSH_HOST"
        return
    fi
    if [ -z "$AWS_INSTANCE_ID" ]; then
        echo ""
        return
    fi
    aws ec2 describe-instances \
        --region "$AWS_REGION" \
        --instance-ids "$AWS_INSTANCE_ID" \
        --query "Reservations[0].Instances[0].PublicDnsName" \
        --output text
}

stop_remote() {
    case "$CLOUD_TARGET" in
        local)
            echo "  Skipping remote cleanup (CLOUD_TARGET=local)."
            ;;
        oci)
            if [ -z "$OCI_SSH_HOST" ]; then
                echo "  OCI_SSH_HOST not set. Skipping OCI remote cleanup." >&2
                return
            fi

            echo "  Stopping OCI bot..."
            ssh "${oci_ssh_opts[@]}" "$OCI_SSH_USER@$OCI_SSH_HOST" "sudo systemctl stop '$OCI_SERVICE_NAME' 2>/dev/null || true" 2>/dev/null || true
            sleep 2

            echo "  Removing OCI checkpoint state..."
            ssh "${oci_ssh_opts[@]}" "$OCI_SSH_USER@$OCI_SSH_HOST" "rm -f '$OCI_REMOTE_DIR'/dctrading.checkpoint '$OCI_REMOTE_DIR'/dctrading.checkpoint.tmp '$OCI_REMOTE_DIR'/dctrading.checkpoint.bak.*" 2>/dev/null || true

            if [ -n "$OCI_INSTANCE_OCID" ] && command -v oci >/dev/null 2>&1; then
                echo "  Stopping OCI instance..."
                oci compute instance action --instance-id "$OCI_INSTANCE_OCID" --action STOP >/dev/null || true
            fi
            ;;
        aws)
            local host
            host="$(aws_host)"
            if [ -z "$host" ] || [ "$host" = "None" ]; then
                echo "  Could not resolve AWS host. Set AWS_SSH_HOST or AWS_INSTANCE_ID. Skipping remote cleanup." >&2
                return
            fi

            echo "  Stopping AWS bot..."
            ssh "${ssh_opts[@]}" "$AWS_SSH_USER@$host" "sudo systemctl stop '$AWS_SERVICE_NAME' 2>/dev/null || true" 2>/dev/null || true
            sleep 2

            echo "  Removing AWS checkpoint state..."
            ssh "${ssh_opts[@]}" "$AWS_SSH_USER@$host" "rm -f '$AWS_REMOTE_DIR'/dctrading.checkpoint '$AWS_REMOTE_DIR'/dctrading.checkpoint.tmp '$AWS_REMOTE_DIR'/dctrading.checkpoint.bak.*" 2>/dev/null || true

            if [ -n "$AWS_INSTANCE_ID" ]; then
                echo "  Stopping AWS instance..."
                aws ec2 stop-instances \
                    --region "$AWS_REGION" \
                    --instance-ids "$AWS_INSTANCE_ID" \
                    >/dev/null || true
            fi
            ;;
        gcp)
            echo "  Stopping GCP bot..."
            gcloud compute ssh "$GCP_INSTANCE" --zone="$GCP_ZONE" --command="sudo systemctl stop '$GCP_SERVICE_NAME'" 2>/dev/null || true
            sleep 2

            echo "  Removing GCP checkpoint state..."
            gcloud compute ssh "$GCP_INSTANCE" --zone="$GCP_ZONE" --command="rm -f '$GCP_REMOTE_DIR'/dctrading.checkpoint '$GCP_REMOTE_DIR'/dctrading.checkpoint.tmp '$GCP_REMOTE_DIR'/dctrading.checkpoint.bak.*" 2>/dev/null || true

            echo "  Stopping GCP instance..."
            gcloud compute instances stop "$GCP_INSTANCE" --zone="$GCP_ZONE" --quiet >/dev/null || true
            ;;
        *)
            echo "Unsupported CLOUD_TARGET=$CLOUD_TARGET. Use oci, aws, gcp, or local." >&2
            exit 1
            ;;
    esac
}

echo "⚠️  This will destroy ALL trading data (local + remote). Press Ctrl-C to cancel."
sleep 3

stop_remote

echo "  Dropping Turso tables..."
curl -s "https://$TURSO_HOST/v2/pipeline" \
  -H "Authorization: Bearer $TURSO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requests": [
    {"type": "execute", "stmt": {"sql": "DROP TABLE IF EXISTS transfers"}},
    {"type": "execute", "stmt": {"sql": "DROP TABLE IF EXISTS accounts"}},
    {"type": "execute", "stmt": {"sql": "DROP TABLE IF EXISTS equity_log"}},
    {"type": "execute", "stmt": {"sql": "DROP TABLE IF EXISTS resource_log"}},
    {"type": "execute", "stmt": {"sql": "DROP TABLE IF EXISTS checkpoint_backups"}},
    {"type": "execute", "stmt": {"sql": "DROP TABLE IF EXISTS bot_status"}}
  ]}' > /dev/null
echo "  ✓ Tables dropped"

echo "  Deleting local checkpoint state..."
rm -f "$PROJECT_DIR"/dctrading.checkpoint "$PROJECT_DIR"/dctrading.checkpoint.tmp "$PROJECT_DIR"/dctrading.checkpoint.bak.*
echo "  ✓ Local checkpoint state deleted"

echo "  Closing Alpaca positions..."
curl -s -X DELETE "https://paper-api.alpaca.markets/v2/positions" \
  -H "APCA-API-KEY-ID: $ALPACA_API_KEY" \
  -H "APCA-API-SECRET-KEY: $ALPACA_API_SECRET" > /dev/null 2>&1
echo "  ✓ Alpaca positions closed"

echo "🔥 All nuked. Ready for fresh start."
