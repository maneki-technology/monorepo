#!/bin/bash
# Switch trading bot from cloud to local.
# Defaults to OCI Ampere A1; set CLOUD_TARGET=aws or gcp for legacy paths.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CLOUD_TARGET="${CLOUD_TARGET:-oci}"

GCP_ZONE="${GCP_ZONE:-asia-northeast1-b}"
GCP_INSTANCE="${GCP_INSTANCE:-dctrading-asia}"

AWS_REGION="${AWS_REGION:-ap-northeast-1}"
AWS_INSTANCE_ID="${AWS_INSTANCE_ID:-}"
AWS_SSH_USER="${AWS_SSH_USER:-ec2-user}"
AWS_SSH_KEY="${AWS_SSH_KEY:-}"
AWS_REMOTE_DIR="${AWS_REMOTE_DIR:-.}"
AWS_SERVICE_NAME="${AWS_SERVICE_NAME:-dctrading}"
export AWS_PROFILE="${AWS_PROFILE:-AdministratorAccess-118740508718}"

OCI_SSH_HOST="${OCI_SSH_HOST:-}"
OCI_SSH_USER="${OCI_SSH_USER:-ubuntu}"
OCI_SSH_KEY="${OCI_SSH_KEY:-}"
OCI_REMOTE_DIR="${OCI_REMOTE_DIR:-.}"
OCI_SERVICE_NAME="${OCI_SERVICE_NAME:-dctrading}"
OCI_INSTANCE_OCID="${OCI_INSTANCE_OCID:-}"

if [ "$CLOUD_TARGET" = "aws" ] && ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "AWS SSO token expired or invalid. Launching login..."
    aws sso login --profile "$AWS_PROFILE"
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        echo "AWS authentication failed after login." >&2
        exit 1
    fi
fi

ssh_opts=(-o StrictHostKeyChecking=accept-new -o LogLevel=ERROR)
if [ -n "$AWS_SSH_KEY" ]; then
    ssh_opts+=(-i "$AWS_SSH_KEY")
fi

oci_ssh_opts=(-o StrictHostKeyChecking=accept-new -o LogLevel=ERROR)
if [ -n "$OCI_SSH_KEY" ]; then
    oci_ssh_opts+=(-i "$OCI_SSH_KEY")
fi

aws_host() {
    if [ -n "${AWS_SSH_HOST:-}" ]; then
        printf "%s\n" "$AWS_SSH_HOST"
        return
    fi

    if [ -z "$AWS_INSTANCE_ID" ]; then
        echo "Set AWS_INSTANCE_ID or AWS_SSH_HOST for CLOUD_TARGET=aws." >&2
        exit 1
    fi

    aws ec2 describe-instances \
        --region "$AWS_REGION" \
        --instance-ids "$AWS_INSTANCE_ID" \
        --query "Reservations[0].Instances[0].PublicDnsName" \
        --output text
}

aws_remote() {
    local host="$1"
    shift
    ssh "${ssh_opts[@]}" "$AWS_SSH_USER@$host" "$@"
}

oci_remote() {
    local host="$1"
    shift
    ssh "${oci_ssh_opts[@]}" "$OCI_SSH_USER@$host" "$@"
}

download_aws_checkpoints() {
    local host="$1"

    echo "  Downloading checkpoint state from AWS..."
    rm -f dctrading.checkpoint.tmp dctrading.checkpoint.bak.*
    if aws_remote "$host" "cd '$AWS_REMOTE_DIR' && bash -lc 'shopt -s nullglob; files=(dctrading.checkpoint dctrading.checkpoint.bak.*); [ \${#files[@]} -gt 0 ] && tar -czf - \"\${files[@]}\"' 2>/dev/null" | tar -xzf - 2>/dev/null; then
        rm -f dctrading.checkpoint.tmp
        echo "  Checkpoint state downloaded."
    else
        echo "  No checkpoint state on AWS; bot can restore from Turso if configured."
    fi
}

download_oci_checkpoints() {
    local host="$1"

    echo "  Downloading checkpoint state from OCI..."
    rm -f dctrading.checkpoint.tmp dctrading.checkpoint.bak.*
    if oci_remote "$host" "cd '$OCI_REMOTE_DIR' && bash -lc 'shopt -s nullglob; files=(dctrading.checkpoint dctrading.checkpoint.bak.*); [ \${#files[@]} -gt 0 ] && tar -czf - \"\${files[@]}\"' 2>/dev/null" | tar -xzf - 2>/dev/null; then
        rm -f dctrading.checkpoint.tmp
        echo "  Checkpoint state downloaded."
    else
        echo "  No checkpoint state on OCI; bot can restore from Turso if configured."
    fi
}

stop_oci_instance_if_configured() {
    if [ -z "$OCI_INSTANCE_OCID" ]; then
        echo "  OCI_INSTANCE_OCID not set; leaving instance running."
        return
    fi
    if ! command -v oci >/dev/null 2>&1; then
        echo "  oci CLI unavailable; leaving instance running." >&2
        return
    fi
    echo "  Stopping OCI instance..."
    oci compute instance action --instance-id "$OCI_INSTANCE_OCID" --action STOP >/dev/null &
}

stop_cloud() {
    case "$CLOUD_TARGET" in
        oci)
            if [ -z "$OCI_SSH_HOST" ]; then
                echo "Set OCI_SSH_HOST for CLOUD_TARGET=oci." >&2
                exit 1
            fi

            echo "  Stopping OCI bot..."
            oci_remote "$OCI_SSH_HOST" "sudo systemctl stop '$OCI_SERVICE_NAME'" 2>/dev/null || true
            sleep 2
            download_oci_checkpoints "$OCI_SSH_HOST"
            stop_oci_instance_if_configured
            ;;
        aws)
            if [ -z "$AWS_INSTANCE_ID" ] && [ -z "${AWS_SSH_HOST:-}" ]; then
                echo "Set AWS_INSTANCE_ID or AWS_SSH_HOST for CLOUD_TARGET=aws." >&2
                exit 1
            fi
            local host
            host="$(aws_host)"
            if [ -z "$host" ] || [ "$host" = "None" ]; then
                echo "Could not resolve AWS instance public DNS. Set AWS_SSH_HOST manually." >&2
                exit 1
            fi

            echo "  Stopping AWS bot..."
            aws_remote "$host" "sudo systemctl stop '$AWS_SERVICE_NAME'" 2>/dev/null || true
            sleep 2
            download_aws_checkpoints "$host"

            if [ -n "$AWS_INSTANCE_ID" ]; then
                echo "  Stopping AWS instance..."
                aws ec2 stop-instances \
                    --region "$AWS_REGION" \
                    --instance-ids "$AWS_INSTANCE_ID" \
                    >/dev/null &
            else
                echo "  AWS_SSH_HOST was used without AWS_INSTANCE_ID; leaving instance state unchanged."
            fi
            ;;
        gcp)
            echo "  Stopping GCP bot..."
            gcloud compute ssh "$GCP_INSTANCE" --zone="$GCP_ZONE" --command="sudo systemctl stop dctrading" 2>/dev/null || true
            sleep 2
            echo "  Downloading checkpoint state from GCP..."
            rm -f dctrading.checkpoint.tmp dctrading.checkpoint.bak.*
            gcloud compute scp "$GCP_INSTANCE:~/dctrading.checkpoint*" . --zone="$GCP_ZONE" 2>/dev/null && {
                rm -f dctrading.checkpoint.tmp
                echo "  Checkpoint state downloaded."
            } || echo "  No checkpoint state on GCP; bot can restore from Turso if configured."

            echo "  Stopping GCP instance..."
            gcloud compute instances stop "$GCP_INSTANCE" --zone="$GCP_ZONE" --quiet &
            ;;
        *)
            echo "Unsupported CLOUD_TARGET=$CLOUD_TARGET. Use oci, aws, or gcp." >&2
            exit 1
            ;;
    esac
}

cd "$PROJECT_DIR"

echo "🔄 Switching to local..."

stop_cloud

# Build macOS binary
echo "  Building macOS binary..."
zig build -Doptimize=ReleaseFast
echo "  macOS binary ready."

# Start local bot
echo "  Starting local bot..."
tmux has-session -t trading 2>/dev/null || tmux new-session -d -s trading
tmux send-keys -t trading "source $PROJECT_DIR/.env && cd $PROJECT_DIR && caffeinate -s -i ./zig-out/bin/dctrading -" Enter

sleep 8
echo "  Checking local bot..."
tmux capture-pane -t trading -p -S -5 | grep -v "^$" | tail -3

echo "✅ Bot running locally"
