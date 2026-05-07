#!/bin/bash
# Switch trading bot from local to AWS Tokyo.
# Builds Linux binary, uploads it with checkpoint state, and starts systemd.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

AWS_REGION="${AWS_REGION:-ap-northeast-1}"
AWS_INSTANCE_ID="${AWS_INSTANCE_ID:?Set AWS_INSTANCE_ID to the EC2 instance id}"
AWS_SSH_USER="${AWS_SSH_USER:-ec2-user}"
AWS_SSH_KEY="${AWS_SSH_KEY:-}"
AWS_REMOTE_DIR="${AWS_REMOTE_DIR:-.}"
AWS_SERVICE_NAME="${AWS_SERVICE_NAME:-dctrading}"
export AWS_PROFILE="${AWS_PROFILE:-AdministratorAccess-118740508718}"

if ! command -v aws >/dev/null 2>&1; then
    echo "aws CLI not found. Install it and authenticate first." >&2
    exit 1
fi

if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "AWS SSO token expired or invalid. Launching login..."
    aws sso login --profile "$AWS_PROFILE"
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        echo "AWS authentication failed after login." >&2
        exit 1
    fi
fi

# Verify instance exists before starting
if ! aws ec2 describe-instances --region "$AWS_REGION" --instance-ids "$AWS_INSTANCE_ID" >/dev/null 2>&1; then
    echo "Instance $AWS_INSTANCE_ID not found in $AWS_REGION." >&2
    echo "Run ./scripts/create-aws-instance.sh to provision it first." >&2
    exit 1
fi

ssh_opts=(-o StrictHostKeyChecking=accept-new)
if [ -n "$AWS_SSH_KEY" ]; then
    ssh_opts+=(-i "$AWS_SSH_KEY")
fi

aws_host() {
    if [ -n "${AWS_SSH_HOST:-}" ]; then
        printf "%s\n" "$AWS_SSH_HOST"
        return
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

upload() {
    local host="$1"
    shift
    scp "${ssh_opts[@]}" "$@" "$AWS_SSH_USER@$host:$AWS_REMOTE_DIR/"
}

cd "$PROJECT_DIR"

echo "Switching to AWS Tokyo..."

echo "  Stopping local bot..."
tmux send-keys -t trading C-c 2>/dev/null || true
sleep 3

echo "  Building Linux binary..."
zig build -Doptimize=ReleaseFast -Dtarget=x86_64-linux
echo "  Linux binary ready."

echo "  Starting AWS instance..."
aws ec2 start-instances \
    --region "$AWS_REGION" \
    --instance-ids "$AWS_INSTANCE_ID" \
    >/dev/null
aws ec2 wait instance-running \
    --region "$AWS_REGION" \
    --instance-ids "$AWS_INSTANCE_ID"

HOST="$(aws_host)"
if [ -z "$HOST" ] || [ "$HOST" = "None" ]; then
    echo "Could not resolve AWS instance public DNS. Set AWS_SSH_HOST manually." >&2
    exit 1
fi

echo "  Waiting for SSH at $HOST..."
for attempt in {1..30}; do
    if aws_remote "$HOST" "true" 2>/dev/null; then
        break
    fi
    if [ "$attempt" -eq 30 ]; then
        echo "Timed out waiting for SSH." >&2
        exit 1
    fi
    sleep 5
done

echo "  Ensuring remote directory exists..."
aws_remote "$HOST" "mkdir -p '$AWS_REMOTE_DIR'"

echo "  Uploading binary..."
aws_remote "$HOST" "sudo systemctl stop '$AWS_SERVICE_NAME' 2>/dev/null || true; chmod +w '$AWS_REMOTE_DIR/dctrading' 2>/dev/null || true"
upload "$HOST" zig-out/bin/dctrading
aws_remote "$HOST" "chmod +x '$AWS_REMOTE_DIR/dctrading'"

shopt -s nullglob
checkpoint_files=(dctrading.checkpoint dctrading.checkpoint.bak.*)
if [ ${#checkpoint_files[@]} -gt 0 ]; then
    echo "  Uploading checkpoint state..."
    aws_remote "$HOST" "rm -f '$AWS_REMOTE_DIR/dctrading.checkpoint.tmp' '$AWS_REMOTE_DIR'/dctrading.checkpoint.bak.*"
    upload "$HOST" "${checkpoint_files[@]}"
else
    echo "  No local checkpoint state to upload; bot can restore from Turso if configured."
fi

echo "  Starting bot on AWS..."
aws_remote "$HOST" "sudo systemctl start '$AWS_SERVICE_NAME'"

sleep 5
echo "  Checking AWS bot..."
aws_remote "$HOST" "sudo journalctl -u '$AWS_SERVICE_NAME' -n 5 --no-pager"

echo "Bot running on AWS Tokyo"
