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
    local live_host
    live_host=$(aws ec2 describe-instances \
        --region "$AWS_REGION" \
        --instance-ids "$AWS_INSTANCE_ID" \
        --query "Reservations[0].Instances[0].PublicDnsName" \
        --output text)

    if [ -n "$live_host" ] && [ "$live_host" != "None" ]; then
        printf "%s\n" "$live_host"
        return
    fi

    if [ -n "${AWS_SSH_HOST:-}" ]; then
        printf "%s\n" "$AWS_SSH_HOST"
        return
    fi

    echo ""
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

stop_local_bot() {
    local pid
    pid=$(ps aux | awk '/[d]ctrading -/ && !/caffeinate/ {print $2}' | head -1)
    if [ -z "$pid" ]; then
        echo "  Local bot not running."
        return
    fi

    echo "  Stopping local bot (PID $pid, SIGINT)..."
    kill -INT "$pid" 2>/dev/null || true

    echo "  Waiting for graceful shutdown (checkpoint save + Turso flush)..."
    for i in {1..30}; do
        if ! ps aux | awk '/[d]ctrading -/ && !/caffeinate/ {found=1} END {exit !found}'; then
            echo "  Local bot stopped gracefully."
            return
        fi
        sleep 1
    done

    pid=$(ps aux | awk '/[d]ctrading -/ && !/caffeinate/ {print $2}' | head -1)
    if [ -n "$pid" ]; then
        echo "  WARNING: Bot still running after 30s. Force-killing (checkpoint may be lost)..." >&2
        kill -KILL "$pid" 2>/dev/null || true
        sleep 2
    fi
}

stop_local_bot

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

PUBLIC_IP=$(aws ec2 describe-instances \
    --region "$AWS_REGION" \
    --instance-ids "$AWS_INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)
echo "  Public IP: $PUBLIC_IP"

# Ensure security group allows SSH from current IP
MY_IP=$(curl -s https://checkip.amazonaws.com)
SG_IDS=$(aws ec2 describe-instances \
    --region "$AWS_REGION" \
    --instance-ids "$AWS_INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].SecurityGroups[*].GroupId' \
    --output text)
echo "  Security groups: $SG_IDS"
for sg in $SG_IDS; do
    echo "  Ensuring SG $sg allows SSH from $MY_IP..."
    aws ec2 authorize-security-group-ingress \
        --region "$AWS_REGION" \
        --group-id "$sg" \
        --protocol tcp \
        --port 22 \
        --cidr "${MY_IP}/32" >/dev/null 2>&1 || true
done

echo "  Waiting for SSH at $HOST..."
for attempt in {1..30}; do
    printf "    attempt %d/30...\r" "$attempt"
    if ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=5 -o BatchMode=yes \
        "${ssh_opts[@]}" "$AWS_SSH_USER@$HOST" "true" 2>/dev/null; then
        echo ""
        break
    fi
    if [ "$attempt" -eq 30 ]; then
        echo ""
        echo "Timed out waiting for SSH." >&2
        echo "Check AWS console: ensure the instance has a public IP and security group allows port 22 from ${MY_IP}/32." >&2
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

if [ -f "$PROJECT_DIR/.env" ]; then
    echo "  Uploading .env..."
    upload "$HOST" "$PROJECT_DIR/.env"
fi

shopt -s nullglob
checkpoint_files=(dctrading.checkpoint dctrading.checkpoint.bak.*)
if [ ${#checkpoint_files[@]} -gt 0 ]; then
    echo "  Uploading checkpoint state..."
    aws_remote "$HOST" "rm -f '$AWS_REMOTE_DIR/dctrading.checkpoint.tmp' '$AWS_REMOTE_DIR'/dctrading.checkpoint.bak.*"
    upload "$HOST" "${checkpoint_files[@]}"
else
    echo "  No local checkpoint state to upload; bot can restore from Turso if configured."
fi

echo "  Updating systemd service..."
aws_remote "$HOST" "sudo tee /etc/systemd/system/$AWS_SERVICE_NAME.service > /dev/null <<'EOF'
[Unit]
Description=DCTrading Bot
After=network.target

[Service]
Type=simple
User=$AWS_SSH_USER
WorkingDirectory=/home/$AWS_SSH_USER
ExecStart=/bin/bash -lc 'source /home/$AWS_SSH_USER/.env && /home/$AWS_SSH_USER/$AWS_REMOTE_DIR/dctrading -'
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload"

echo "  Starting bot on AWS..."
aws_remote "$HOST" "sudo systemctl start '$AWS_SERVICE_NAME'"

sleep 5
echo "  Checking AWS bot..."
aws_remote "$HOST" "sudo journalctl -u '$AWS_SERVICE_NAME' -n 5 --no-pager"

echo "Bot running on AWS Tokyo"
