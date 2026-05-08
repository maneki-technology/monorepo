#!/bin/bash
# One-time AWS infrastructure setup for DCTrading bot.
# Provisions: security group, key pair, EC2 instance (free-tier by default),
#             8GB gp3 root volume, systemd service.
# Run this once, then use switch-to-aws.sh for deployments.
#
# Free-tier notes:
#   - t2.micro is free for 12 months (750 hrs/mo).
#   - 8GB gp3 stays within the 30GB EBS free-tier allowance.
#   - An Elastic IP is free while attached to a running instance.
#   - Monitor your bill; data-transfer out is not free-tier.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

AWS_REGION="${AWS_REGION:-ap-northeast-1}"
AWS_INSTANCE_TYPE="${AWS_INSTANCE_TYPE:-t3.micro}"
AWS_KEY_NAME="${AWS_KEY_NAME:-dctrading-aws}"
AWS_SERVICE_NAME="${AWS_SERVICE_NAME:-dctrading}"
AWS_REMOTE_DIR="${AWS_REMOTE_DIR:-.}"
AWS_SSH_USER="${AWS_SSH_USER:-ec2-user}"
AWS_IAM_INSTANCE_PROFILE="${AWS_IAM_INSTANCE_PROFILE:-}"
export AWS_PROFILE="${AWS_PROFILE:-AdministratorAccess-118740508718}"

if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "AWS SSO token expired or invalid. Launching login..."
    aws sso login --profile "$AWS_PROFILE"
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        echo "AWS authentication failed after login." >&2
        exit 1
    fi
fi

for cmd in aws jq curl; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "$cmd is required but not installed." >&2
        exit 1
    fi
done

echo "Creating AWS resources in $AWS_REGION..."

# --- Security Group ---
SG_NAME="dctrading-sg"
SG_ID=$(aws ec2 describe-security-groups \
    --region "$AWS_REGION" \
    --filters "Name=group-name,Values=$SG_NAME" \
    --query 'SecurityGroups[0].GroupId' \
    --output text 2>/dev/null || true)

if [ -z "$SG_ID" ] || [ "$SG_ID" = "None" ]; then
    echo "  Creating security group $SG_NAME..."
    VPC_ID=$(aws ec2 describe-vpcs \
        --region "$AWS_REGION" \
        --filters "Name=is-default,Values=true" \
        --query 'Vpcs[0].VpcId' \
        --output text)
    SG_ID=$(aws ec2 create-security-group \
        --region "$AWS_REGION" \
        --group-name "$SG_NAME" \
        --description "DCTrading bot SSH access" \
        --vpc-id "$VPC_ID" \
        --query 'GroupId' \
        --output text)
    MY_IP=$(curl -s https://checkip.amazonaws.com)
    aws ec2 authorize-security-group-ingress \
        --region "$AWS_REGION" \
        --group-id "$SG_ID" \
        --protocol tcp \
        --port 22 \
        --cidr "${MY_IP}/32" >/dev/null
    echo "  Security group created: $SG_ID (SSH from $MY_IP)"
else
    echo "  Using existing security group: $SG_ID"
fi

# --- Key Pair ---
KEY_PATH="$PROJECT_DIR/${AWS_KEY_NAME}.pem"
if aws ec2 describe-key-pairs --region "$AWS_REGION" --key-names "$AWS_KEY_NAME" >/dev/null 2>&1; then
    echo "  Using existing key pair: $AWS_KEY_NAME"
    if [ ! -f "$KEY_PATH" ]; then
        echo "  Warning: private key not found at $KEY_PATH" >&2
        echo "  You will need the matching private key to SSH." >&2
    fi
else
    echo "  Creating key pair: $AWS_KEY_NAME..."
    aws ec2 create-key-pair \
        --region "$AWS_REGION" \
        --key-name "$AWS_KEY_NAME" \
        --query 'KeyMaterial' \
        --output text > "$KEY_PATH"
    chmod 600 "$KEY_PATH"
    echo "  Private key saved to: $KEY_PATH"
fi

# --- AMI ---
echo "  Finding latest Amazon Linux 2023 AMI..."
AMI_JSON=$(aws ec2 describe-images \
    --region "$AWS_REGION" \
    --owners amazon \
    --filters "Name=name,Values=al2023-ami-*-x86_64" "Name=state,Values=available" \
    --query 'Images | sort_by(@, &CreationDate) | [-1]' \
    --output json)
AMI_ID=$(echo "$AMI_JSON" | jq -r '.ImageId')
ROOT_DEVICE=$(echo "$AMI_JSON" | jq -r '.RootDeviceName')
echo "  AMI: $AMI_ID (root: $ROOT_DEVICE)"

# --- Check for existing instance ---
EXISTING=$(aws ec2 describe-instances \
    --region "$AWS_REGION" \
    --filters "Name=tag:Name,Values=dctrading" "Name=instance-state-name,Values=running,stopped" \
    --query 'Reservations[0].Instances[0].InstanceId' \
    --output text 2>/dev/null || true)

if [ -n "$EXISTING" ] && [ "$EXISTING" != "None" ]; then
    echo "  Existing dctrading instance found: $EXISTING"
    INSTANCE_ID="$EXISTING"

    STATE=$(aws ec2 describe-instances \
        --region "$AWS_REGION" \
        --instance-ids "$INSTANCE_ID" \
        --query 'Reservations[0].Instances[0].State.Name' \
        --output text)

    if [ "$STATE" = "stopped" ]; then
        echo "  Instance is stopped. Starting it..."
        aws ec2 start-instances --region "$AWS_REGION" --instance-ids "$INSTANCE_ID" >/dev/null
        aws ec2 wait instance-running --region "$AWS_REGION" --instance-ids "$INSTANCE_ID"
    else
        echo "  Instance is already running."
    fi
else
    echo "  Launching EC2 instance ($AWS_INSTANCE_TYPE)..."
    IAM_ARG=""
    if [ -n "$AWS_IAM_INSTANCE_PROFILE" ]; then
        "$SCRIPT_DIR/setup-aws-iam.sh" || true
        IAM_ARG="--iam-instance-profile Name=$AWS_IAM_INSTANCE_PROFILE"
    fi

    INSTANCE_ID=$(aws ec2 run-instances \
    --region "$AWS_REGION" \
    --image-id "$AMI_ID" \
    --instance-type "$AWS_INSTANCE_TYPE" \
    --key-name "$AWS_KEY_NAME" \
    --security-group-ids "$SG_ID" \
    --block-device-mappings "[{\"DeviceName\":\"$ROOT_DEVICE\",\"Ebs\":{\"VolumeSize\":8,\"VolumeType\":\"gp3\",\"DeleteOnTermination\":true}}]" \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=dctrading}]" \
    $IAM_ARG \
    --user-data "$(cat <<EOF
#!/bin/bash
set -e

# Install CloudWatch agent
dnf install -y amazon-cloudwatch-agent

# Create log file for bot
touch /var/log/dctrading.log
chown $AWS_SSH_USER:$AWS_SSH_USER /var/log/dctrading.log
chmod 644 /var/log/dctrading.log

# CloudWatch agent config (logs + memory metrics)
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json <<'CWCONFIG'
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/dctrading.log",
            "log_group_name": "dctrading",
            "log_stream_name": "{instance_id}",
            "timezone": "UTC"
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "dctrading",
    "metrics_collected": {
      "mem": {
        "measurement": ["mem_used_percent"],
        "metrics_collection_interval": 300
      },
      "disk": {
        "measurement": ["disk_used_percent"],
        "metrics_collection_interval": 300,
        "resources": ["/"]
      }
    }
  }
}
CWCONFIG

/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config -m ec2 -s \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

# Systemd service
mkdir -p /home/$AWS_SSH_USER/$AWS_REMOTE_DIR
cat > /etc/systemd/system/$AWS_SERVICE_NAME.service <<'UNIT'
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
UNIT
systemctl daemon-reload
systemctl enable $AWS_SERVICE_NAME
EOF
)" \
    --query 'Instances[0].InstanceId' \
    --output text)
fi

echo "  Instance ready: $INSTANCE_ID"

aws ec2 wait instance-running --region "$AWS_REGION" --instance-ids "$INSTANCE_ID"

HOST=$(aws ec2 describe-instances \
    --region "$AWS_REGION" \
    --instance-ids "$INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].PublicDnsName' \
    --output text)

if [ -z "$HOST" ] || [ "$HOST" = "None" ]; then
    echo "Instance has no public DNS yet. Waiting..."
    sleep 10
    HOST=$(aws ec2 describe-instances \
        --region "$AWS_REGION" \
        --instance-ids "$INSTANCE_ID" \
        --query 'Reservations[0].Instances[0].PublicDnsName' \
        --output text)
fi

echo "  Waiting for SSH at $HOST..."
for attempt in {1..30}; do
    if ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=5 \
        -i "$KEY_PATH" "$AWS_SSH_USER@$HOST" "true" 2>/dev/null; then
        break
    fi
    if [ "$attempt" -eq 30 ]; then
        echo "Timed out waiting for SSH." >&2
        exit 1
    fi
    sleep 5
done

echo ""
echo "✅ AWS instance ready!"
echo ""
echo "Add these to your .env:"
echo "  AWS_REGION=$AWS_REGION"
echo "  AWS_INSTANCE_ID=$INSTANCE_ID"
echo "  AWS_SSH_USER=$AWS_SSH_USER"
echo "  AWS_SSH_KEY=$KEY_PATH"
echo "  AWS_SSH_HOST=$HOST"
echo "  AWS_REMOTE_DIR=$AWS_REMOTE_DIR"
echo "  AWS_SERVICE_NAME=$AWS_SERVICE_NAME"
echo ""
if [ -z "$AWS_IAM_INSTANCE_PROFILE" ]; then
    echo "⚠️  CloudWatch requires an IAM instance profile."
    echo "   Create a role with the CloudWatchAgentServerPolicy managed policy,"
    echo "   then set AWS_IAM_INSTANCE_PROFILE=your-role-name before re-running."
    echo "   See README.md for step-by-step instructions."
    echo ""
fi
echo "Then deploy with:"
echo "  ./scripts/deploy-aws.sh"
