#!/bin/bash
# Create or verify the IAM instance profile for CloudWatch Logs/Metrics.
# Uses AWS_IAM_INSTANCE_PROFILE env var (default: dctrading-ec2-role).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

AWS_IAM_INSTANCE_PROFILE="${AWS_IAM_INSTANCE_PROFILE:-dctrading-ec2-role}"
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

if aws iam get-instance-profile --instance-profile-name "$AWS_IAM_INSTANCE_PROFILE" >/dev/null 2>&1; then
    echo "IAM instance profile already exists: $AWS_IAM_INSTANCE_PROFILE"
    exit 0
fi

echo "Creating IAM instance profile: $AWS_IAM_INSTANCE_PROFILE..."

TRUST_POLICY='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}'

if ! aws iam create-role \
    --role-name "$AWS_IAM_INSTANCE_PROFILE" \
    --assume-role-policy-document "$TRUST_POLICY" >/dev/null 2>&1; then
    echo "ERROR: Failed to create IAM role '$AWS_IAM_INSTANCE_PROFILE'." >&2
    echo "You may not have IAM permissions (iam:CreateRole, iam:AttachRolePolicy, iam:CreateInstanceProfile, iam:AddRoleToInstanceProfile)." >&2
    exit 1
fi

if ! aws iam attach-role-policy \
    --role-name "$AWS_IAM_INSTANCE_PROFILE" \
    --policy-arn arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy >/dev/null 2>&1; then
    echo "WARNING: Failed to attach CloudWatchAgentServerPolicy to role '$AWS_IAM_INSTANCE_PROFILE'." >&2
fi

if ! aws iam create-instance-profile \
    --instance-profile-name "$AWS_IAM_INSTANCE_PROFILE" >/dev/null 2>&1; then
    echo "ERROR: Failed to create IAM instance profile '$AWS_IAM_INSTANCE_PROFILE'." >&2
    exit 1
fi

if ! aws iam add-role-to-instance-profile \
    --instance-profile-name "$AWS_IAM_INSTANCE_PROFILE" \
    --role-name "$AWS_IAM_INSTANCE_PROFILE" >/dev/null 2>&1; then
    echo "ERROR: Failed to add role to instance profile '$AWS_IAM_INSTANCE_PROFILE'." >&2
    exit 1
fi

# IAM is eventually consistent; wait until visible
echo "Waiting for IAM profile propagation..."
for attempt in {1..12}; do
    if aws iam get-instance-profile --instance-profile-name "$AWS_IAM_INSTANCE_PROFILE" >/dev/null 2>&1; then
        echo "IAM instance profile ready: $AWS_IAM_INSTANCE_PROFILE"
        exit 0
    fi
    sleep 5
done

echo "WARNING: IAM instance profile not visible after 60s. It may not be usable yet." >&2
