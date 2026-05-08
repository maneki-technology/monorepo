#!/bin/bash
# Deploy trading bot to AWS Tokyo in place.
# Builds Linux binary, uploads it + .env, restarts systemd.
# Does NOT stop local bot, start EC2, or migrate checkpoints.
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

# Verify instance exists and is running
STATE=$(aws ec2 describe-instances \
    --region "$AWS_REGION" \
    --instance-ids "$AWS_INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].State.Name' \
    --output text)

if [ -z "$STATE" ] || [ "$STATE" = "None" ]; then
    echo "Instance $AWS_INSTANCE_ID not found in $AWS_REGION." >&2
    echo "Run ./scripts/create-aws-instance.sh to provision it first." >&2
    exit 1
fi

if [ "$STATE" != "running" ]; then
    echo "Instance is $STATE. Starting it..."
    aws ec2 start-instances --region "$AWS_REGION" --instance-ids "$AWS_INSTANCE_ID" >/dev/null
    aws ec2 wait instance-running --region "$AWS_REGION" --instance-ids "$AWS_INSTANCE_ID"
fi

ssh_opts=(-o StrictHostKeyChecking=accept-new -o LogLevel=ERROR)
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

ensure_instance_iam_profile() {
    local instance_id="$1"
    local profile_name="$2"

    # Ensure IAM profile exists
    "$SCRIPT_DIR/setup-aws-iam.sh" || true

    # Check current association
    local assoc_json
    assoc_json=$(aws ec2 describe-iam-instance-profile-associations \
        --region "$AWS_REGION" \
        --filters "Name=instance-id,Values=$instance_id" \
        --query 'IamInstanceProfileAssociations[0]' \
        --output json 2>/dev/null || echo 'null')

    if [ "$assoc_json" != "null" ] && [ -n "$assoc_json" ] && [ "$assoc_json" != "" ]; then
        local current_name
        current_name=$(echo "$assoc_json" | jq -r '.IamInstanceProfile.Arn // empty' | awk -F/ '{print $NF}')
        if [ "$current_name" = "$profile_name" ]; then
            echo "  IAM instance profile '$profile_name' already attached to instance."
            return 0
        else
            echo "  Instance already has IAM profile '$current_name'. Skipping attachment." >&2
            echo "  To change it, stop the instance and use the AWS console or replace-iam-instance-profile-association." >&2
            return 0
        fi
    fi

    echo "  Attaching IAM instance profile '$profile_name' to instance $instance_id..."
    if aws ec2 associate-iam-instance-profile \
        --region "$AWS_REGION" \
        --instance-id "$instance_id" \
        --iam-instance-profile "Name=$profile_name" >/dev/null 2>&1; then
        echo "  IAM instance profile attached."
    else
        echo "  WARNING: Failed to attach IAM instance profile. CloudWatch may not work." >&2
    fi
}

cd "$PROJECT_DIR"

echo "Deploying to AWS Tokyo..."

echo "  Building Linux binary..."
zig build -Doptimize=ReleaseFast -Dtarget=x86_64-linux
echo "  Linux binary ready."

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
    if ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=5 -o BatchMode=yes -o LogLevel=ERROR \
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

if [ -n "$AWS_IAM_INSTANCE_PROFILE" ]; then
    echo "  Ensuring IAM instance profile..."
    ensure_instance_iam_profile "$AWS_INSTANCE_ID" "$AWS_IAM_INSTANCE_PROFILE"
fi

echo "  Ensuring remote directory exists..."
aws_remote "$HOST" "mkdir -p '$AWS_REMOTE_DIR'"

echo "  Ensuring CloudWatch agent..."
aws_remote "$HOST" "
if [ ! -f /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent ]; then
    sudo dnf install -y amazon-cloudwatch-agent
fi
sudo mkdir -p /opt/aws/amazon-cloudwatch-agent/etc
sudo tee /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json > /dev/null <<'CWCONFIG'
{
  \"logs\": {
    \"logs_collected\": {
      \"files\": {
        \"collect_list\": [
          {
            \"file_path\": \"/var/log/dctrading.log\",
            \"log_group_name\": \"dctrading\",
            \"log_stream_name\": \"{instance_id}\",
            \"timezone\": \"UTC\"
          }
        ]
      }
    }
  },
  \"metrics\": {
    \"namespace\": \"dctrading\",
    \"metrics_collected\": {
      \"mem\": {
        \"measurement\": [\"mem_used_percent\"],
        \"metrics_collection_interval\": 300
      },
      \"disk\": {
        \"measurement\": [\"disk_used_percent\"],
        \"metrics_collection_interval\": 300,
        \"resources\": [\"/\"]
      }
    }
  }
}
CWCONFIG
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config -m ec2 -s \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
sudo touch /var/log/dctrading.log
sudo chown '$AWS_SSH_USER':'$AWS_SSH_USER' /var/log/dctrading.log
sudo chmod 644 /var/log/dctrading.log
"

echo "  Stopping remote bot..."
aws_remote "$HOST" "sudo systemctl stop '$AWS_SERVICE_NAME' 2>/dev/null || true"

echo "  Uploading binary..."
aws_remote "$HOST" "chmod +w '$AWS_REMOTE_DIR/dctrading' 2>/dev/null || true"
upload "$HOST" zig-out/bin/dctrading
aws_remote "$HOST" "chmod +x '$AWS_REMOTE_DIR/dctrading'"

if [ -f "$PROJECT_DIR/.env" ]; then
    echo "  Uploading .env..."
    upload "$HOST" "$PROJECT_DIR/.env"
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
ExecStart=/bin/bash -lc 'export BOT_INSTANCE=aws-tokyo && source /home/$AWS_SSH_USER/.env && /home/$AWS_SSH_USER/$AWS_REMOTE_DIR/dctrading -'
StandardOutput=append:/var/log/dctrading.log
StandardError=append:/var/log/dctrading.log
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload"

echo "  Starting bot on AWS..."
aws_remote "$HOST" "sudo systemctl start '$AWS_SERVICE_NAME'"

echo "  Waiting for bot to bootstrap..."
sleep 5
for i in {1..20}; do
    printf "    checking %d/20...\r" "$i"
    if aws_remote "$HOST" "sudo systemctl is-active '$AWS_SERVICE_NAME' >/dev/null 2>&1"; then
        echo ""
        echo "  Service is active. Fetching logs..."
        break
    fi
    if [ "$i" -eq 20 ]; then
        echo ""
        echo "  WARNING: Service did not become active. Showing logs..." >&2
    fi
    sleep 1
done

echo ""
echo "  --- Recent logs ---"
aws_remote "$HOST" "sudo journalctl -u '$AWS_SERVICE_NAME' -n 20 --no-pager"

echo ""
echo "✅ Deployed to AWS Tokyo"
