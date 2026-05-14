#!/bin/bash
# One-time OCI infrastructure setup for DCTrading bot.
# Provisions: VCN, subnet, internet gateway, route table, security list,
#             SSH key, Ampere A1 instance, log file, and systemd service.
# Run this once, then use deploy-oci.sh or switch-to-oci.sh for deployments.
#
# Always Free notes:
#   - VM.Standard.A1.Flex is Always Free eligible in the tenancy home region.
#   - The free pool is shared across A1 instances: up to 4 OCPUs and 24GB RAM.
#   - Capacity can be temporarily unavailable; rerun later or try another AD.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

OCI_COMPARTMENT_OCID="${OCI_COMPARTMENT_OCID:-}"
OCI_REGION="${OCI_REGION:-ap-singapore-1}"
OCI_HOME_REGION="${OCI_HOME_REGION:-ap-singapore-1}"
OCI_INSTANCE_NAME="${OCI_INSTANCE_NAME:-dctrading}"
OCI_SHAPE="${OCI_SHAPE:-VM.Standard.A1.Flex}"
OCI_OCPUS="${OCI_OCPUS:-4}"
OCI_MEMORY_GB="${OCI_MEMORY_GB:-24}"
OCI_FALLBACK_SIZES="${OCI_FALLBACK_SIZES:-4:24 3:18 2:12 1:6}"
OCI_BOOT_VOLUME_GB="${OCI_BOOT_VOLUME_GB:-50}"
OCI_IMAGE_OCID="${OCI_IMAGE_OCID:-}"
OCI_IMAGE_OS="${OCI_IMAGE_OS:-Canonical Ubuntu}"
OCI_IMAGE_OS_VERSION="${OCI_IMAGE_OS_VERSION:-22.04}"
OCI_KEY_NAME="${OCI_KEY_NAME:-dctrading-oci}"
OCI_SSH_KEY="${OCI_SSH_KEY:-$PROJECT_DIR/${OCI_KEY_NAME}.key}"
OCI_SSH_USER="${OCI_SSH_USER:-ubuntu}"
OCI_REMOTE_DIR="${OCI_REMOTE_DIR:-.}"
OCI_SERVICE_NAME="${OCI_SERVICE_NAME:-dctrading}"

OCI_VCN_NAME="${OCI_VCN_NAME:-dctrading-vcn}"
OCI_SUBNET_NAME="${OCI_SUBNET_NAME:-dctrading-subnet}"
OCI_SECURITY_LIST_NAME="${OCI_SECURITY_LIST_NAME:-dctrading-security-list}"
OCI_INTERNET_GATEWAY_NAME="${OCI_INTERNET_GATEWAY_NAME:-dctrading-igw}"
OCI_ROUTE_TABLE_NAME="${OCI_ROUTE_TABLE_NAME:-dctrading-route-table}"
OCI_VCN_CIDR="${OCI_VCN_CIDR:-10.0.0.0/16}"
OCI_SUBNET_CIDR="${OCI_SUBNET_CIDR:-10.0.1.0/24}"
OCI_VCN_DNS_LABEL="${OCI_VCN_DNS_LABEL:-dctrading}"
OCI_SUBNET_DNS_LABEL="${OCI_SUBNET_DNS_LABEL:-dctrade}"

if [ -z "$OCI_COMPARTMENT_OCID" ]; then
    echo "OCI_COMPARTMENT_OCID is required." >&2
    echo "Set it to the compartment OCID where the bot instance should be created." >&2
    exit 1
fi

for cmd in oci jq curl ssh ssh-keygen; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "$cmd is required but not installed." >&2
        exit 1
    fi
done

OCI_GLOBAL_ARGS=()
if [ -n "$OCI_REGION" ]; then
    OCI_GLOBAL_ARGS+=(--region "$OCI_REGION")
fi

oci_cli() {
    oci "${OCI_GLOBAL_ARGS[@]}" "$@"
}

json_id_by_display_name() {
    jq -r --arg name "$1" '.data[] | select(."display-name" == $name and ."lifecycle-state" != "TERMINATED") | .id' | head -n 1
}

echo "Creating OCI resources for $OCI_INSTANCE_NAME..."
if [ -n "$OCI_REGION" ]; then
    echo "  Region: $OCI_REGION"
else
    echo "  Region: OCI CLI profile default"
fi
if [ -n "$OCI_HOME_REGION" ] && [ "$OCI_REGION" != "$OCI_HOME_REGION" ]; then
    echo "  Warning: OCI_REGION=$OCI_REGION differs from OCI_HOME_REGION=$OCI_HOME_REGION." >&2
    echo "  Always Free compute and block-volume resources must be created in the tenancy home region." >&2
fi

echo "  Checking OCI authentication..."
oci_cli iam availability-domain list --compartment-id "$OCI_COMPARTMENT_OCID" >/dev/null

if [ -n "${OCI_AVAILABILITY_DOMAIN:-}" ]; then
    AVAILABILITY_DOMAINS="$OCI_AVAILABILITY_DOMAIN"
else
    AVAILABILITY_DOMAINS=$(oci_cli iam availability-domain list \
        --compartment-id "$OCI_COMPARTMENT_OCID" \
        --output json | jq -r '.data[].name')
fi
echo "  Availability domains:"
while IFS= read -r ad; do
    [ -n "$ad" ] && echo "    - $ad"
done <<< "$AVAILABILITY_DOMAINS"

# --- SSH Key ---
if [ ! -f "$OCI_SSH_KEY" ]; then
    echo "  Creating SSH key: $OCI_SSH_KEY..."
    mkdir -p "$(dirname "$OCI_SSH_KEY")"
    ssh-keygen -t ed25519 -f "$OCI_SSH_KEY" -N "" -C "$OCI_KEY_NAME" >/dev/null
    chmod 600 "$OCI_SSH_KEY"
else
    echo "  Using existing SSH key: $OCI_SSH_KEY"
fi
if [ ! -f "$OCI_SSH_KEY.pub" ]; then
    ssh-keygen -y -f "$OCI_SSH_KEY" > "$OCI_SSH_KEY.pub"
fi
SSH_PUBLIC_KEY=$(cat "$OCI_SSH_KEY.pub")

# --- VCN ---
VCN_ID=$(oci_cli network vcn list \
    --compartment-id "$OCI_COMPARTMENT_OCID" \
    --display-name "$OCI_VCN_NAME" \
    --output json | json_id_by_display_name "$OCI_VCN_NAME")

if [ -z "$VCN_ID" ]; then
    echo "  Creating VCN $OCI_VCN_NAME..."
    VCN_ID=$(oci_cli network vcn create \
        --compartment-id "$OCI_COMPARTMENT_OCID" \
        --cidr-block "$OCI_VCN_CIDR" \
        --display-name "$OCI_VCN_NAME" \
        --dns-label "$OCI_VCN_DNS_LABEL" \
        --wait-for-state AVAILABLE \
        --query 'data.id' \
        --raw-output)
else
    echo "  Using existing VCN: $VCN_ID"
fi

# --- Internet Gateway ---
IGW_ID=$(oci_cli network internet-gateway list \
    --compartment-id "$OCI_COMPARTMENT_OCID" \
    --vcn-id "$VCN_ID" \
    --display-name "$OCI_INTERNET_GATEWAY_NAME" \
    --output json | json_id_by_display_name "$OCI_INTERNET_GATEWAY_NAME")

if [ -z "$IGW_ID" ]; then
    echo "  Creating internet gateway $OCI_INTERNET_GATEWAY_NAME..."
    IGW_ID=$(oci_cli network internet-gateway create \
        --compartment-id "$OCI_COMPARTMENT_OCID" \
        --vcn-id "$VCN_ID" \
        --is-enabled true \
        --display-name "$OCI_INTERNET_GATEWAY_NAME" \
        --wait-for-state AVAILABLE \
        --query 'data.id' \
        --raw-output)
else
    echo "  Using existing internet gateway: $IGW_ID"
fi

# --- Route Table ---
ROUTE_RULES=$(jq -nc --arg igw "$IGW_ID" '[{cidrBlock:"0.0.0.0/0",networkEntityId:$igw}]')
RT_ID=$(oci_cli network route-table list \
    --compartment-id "$OCI_COMPARTMENT_OCID" \
    --vcn-id "$VCN_ID" \
    --display-name "$OCI_ROUTE_TABLE_NAME" \
    --output json | json_id_by_display_name "$OCI_ROUTE_TABLE_NAME")

if [ -z "$RT_ID" ]; then
    echo "  Creating route table $OCI_ROUTE_TABLE_NAME..."
    RT_ID=$(oci_cli network route-table create \
        --compartment-id "$OCI_COMPARTMENT_OCID" \
        --vcn-id "$VCN_ID" \
        --display-name "$OCI_ROUTE_TABLE_NAME" \
        --route-rules "$ROUTE_RULES" \
        --wait-for-state AVAILABLE \
        --query 'data.id' \
        --raw-output)
else
    echo "  Using existing route table: $RT_ID"
    oci_cli network route-table update \
        --rt-id "$RT_ID" \
        --route-rules "$ROUTE_RULES" \
        --force >/dev/null
fi

# --- Security List ---
MY_IP=$(curl -fsS https://checkip.amazonaws.com 2>/dev/null || curl -fsS https://api.ipify.org)
MY_IP="${MY_IP//$'\n'/}"
INGRESS_RULES=$(jq -nc --arg source "$MY_IP/32" '[
    {
        protocol:"6",
        source:$source,
        tcpOptions:{destinationPortRange:{min:22,max:22}}
    },
    {
        protocol:"1",
        source:"0.0.0.0/0",
        icmpOptions:{type:3,code:4}
    }
]')
EGRESS_RULES=$(jq -nc '[{protocol:"all",destination:"0.0.0.0/0"}]')

SL_ID=$(oci_cli network security-list list \
    --compartment-id "$OCI_COMPARTMENT_OCID" \
    --vcn-id "$VCN_ID" \
    --display-name "$OCI_SECURITY_LIST_NAME" \
    --output json | json_id_by_display_name "$OCI_SECURITY_LIST_NAME")

if [ -z "$SL_ID" ]; then
    echo "  Creating security list $OCI_SECURITY_LIST_NAME (SSH from $MY_IP)..."
    SL_ID=$(oci_cli network security-list create \
        --compartment-id "$OCI_COMPARTMENT_OCID" \
        --vcn-id "$VCN_ID" \
        --display-name "$OCI_SECURITY_LIST_NAME" \
        --ingress-security-rules "$INGRESS_RULES" \
        --egress-security-rules "$EGRESS_RULES" \
        --wait-for-state AVAILABLE \
        --query 'data.id' \
        --raw-output)
else
    echo "  Using existing security list: $SL_ID (refreshing SSH source to $MY_IP)"
    oci_cli network security-list update \
        --security-list-id "$SL_ID" \
        --ingress-security-rules "$INGRESS_RULES" \
        --egress-security-rules "$EGRESS_RULES" \
        --force >/dev/null
fi

# --- Subnet ---
SUBNET_ID=$(oci_cli network subnet list \
    --compartment-id "$OCI_COMPARTMENT_OCID" \
    --vcn-id "$VCN_ID" \
    --display-name "$OCI_SUBNET_NAME" \
    --output json | json_id_by_display_name "$OCI_SUBNET_NAME")

if [ -z "$SUBNET_ID" ]; then
    echo "  Creating public subnet $OCI_SUBNET_NAME..."
    SUBNET_ID=$(oci_cli network subnet create \
        --compartment-id "$OCI_COMPARTMENT_OCID" \
        --vcn-id "$VCN_ID" \
        --cidr-block "$OCI_SUBNET_CIDR" \
        --display-name "$OCI_SUBNET_NAME" \
        --dns-label "$OCI_SUBNET_DNS_LABEL" \
        --route-table-id "$RT_ID" \
        --security-list-ids "[\"$SL_ID\"]" \
        --prohibit-public-ip-on-vnic false \
        --wait-for-state AVAILABLE \
        --query 'data.id' \
        --raw-output)
else
    echo "  Using existing subnet: $SUBNET_ID"
fi

# --- Image ---
IMAGE_ID="$OCI_IMAGE_OCID"
if [ -z "$IMAGE_ID" ]; then
    echo "  Finding latest $OCI_IMAGE_OS $OCI_IMAGE_OS_VERSION image for $OCI_SHAPE..."
    IMAGE_ID=$(oci_cli compute image list \
        --compartment-id "$OCI_COMPARTMENT_OCID" \
        --operating-system "$OCI_IMAGE_OS" \
        --operating-system-version "$OCI_IMAGE_OS_VERSION" \
        --shape "$OCI_SHAPE" \
        --sort-by TIMECREATED \
        --sort-order DESC \
        --all \
        --query 'data[0].id' \
        --raw-output)
fi
if [ -z "$IMAGE_ID" ] || [ "$IMAGE_ID" = "null" ]; then
    echo "Could not find an OCI image. Set OCI_IMAGE_OCID explicitly and rerun." >&2
    exit 1
fi
echo "  Image: $IMAGE_ID"

# --- Instance ---
INSTANCE_ID=$(oci_cli compute instance list \
    --compartment-id "$OCI_COMPARTMENT_OCID" \
    --display-name "$OCI_INSTANCE_NAME" \
    --all \
    --output json | json_id_by_display_name "$OCI_INSTANCE_NAME")

if [ -n "$INSTANCE_ID" ]; then
    echo "  Existing instance found: $INSTANCE_ID"
    STATE=$(oci_cli compute instance get \
        --instance-id "$INSTANCE_ID" \
        --query 'data."lifecycle-state"' \
        --raw-output)
    if [ "$STATE" = "STOPPED" ]; then
        echo "  Instance is stopped. Starting it..."
        oci_cli compute instance action \
            --instance-id "$INSTANCE_ID" \
            --action START \
            --wait-for-state RUNNING >/dev/null
    else
        echo "  Instance state: $STATE"
    fi
else
    METADATA=$(jq -nc --arg key "$SSH_PUBLIC_KEY" '{ssh_authorized_keys:$key}')

    LAUNCH_LOG=$(mktemp)
    trap 'rm -f "$LAUNCH_LOG"' EXIT
    for ad_name in $AVAILABILITY_DOMAINS; do
        for size in $OCI_FALLBACK_SIZES; do
            attempt_ocpus="${size%%:*}"
            attempt_memory="${size##*:}"
            echo "  Launching OCI instance ($OCI_SHAPE, ${attempt_ocpus} OCPU, ${attempt_memory}GB RAM) in $ad_name..."
            SHAPE_CONFIG=$(jq -nc \
                --argjson ocpus "$attempt_ocpus" \
                --argjson memory "$attempt_memory" \
                '{ocpus:$ocpus,memoryInGBs:$memory}')

            if INSTANCE_ID=$(oci_cli compute instance launch \
                --compartment-id "$OCI_COMPARTMENT_OCID" \
                --availability-domain "$ad_name" \
                --display-name "$OCI_INSTANCE_NAME" \
                --shape "$OCI_SHAPE" \
                --subnet-id "$SUBNET_ID" \
                --assign-public-ip true \
                --image-id "$IMAGE_ID" \
                --boot-volume-size-in-gbs "$OCI_BOOT_VOLUME_GB" \
                --shape-config "$SHAPE_CONFIG" \
                --metadata "$METADATA" \
                --wait-for-state RUNNING \
                --query 'data.id' \
                --raw-output 2>"$LAUNCH_LOG"); then
                OCI_OCPUS="$attempt_ocpus"
                OCI_MEMORY_GB="$attempt_memory"
                break 2
            fi

            if grep -qi "Out of host capacity" "$LAUNCH_LOG"; then
                echo "    No A1 capacity for ${attempt_ocpus} OCPU/${attempt_memory}GB in $ad_name; trying next option."
            else
                cat "$LAUNCH_LOG" >&2
                exit 1
            fi
        done
    done

    if [ -z "$INSTANCE_ID" ]; then
        echo "No OCI A1 capacity was available for fallback sizes: $OCI_FALLBACK_SIZES" >&2
        echo "Try rerunning later, setting OCI_AVAILABILITY_DOMAIN to a specific AD, or setting OCI_FALLBACK_SIZES to smaller sizes." >&2
        exit 1
    fi
fi

echo "  Instance ready: $INSTANCE_ID"

echo "  Resolving public IP..."
PUBLIC_IP=""
for _ in {1..30}; do
    VNIC_ID=$(oci_cli compute instance list-vnics \
        --instance-id "$INSTANCE_ID" \
        --query 'data[0].id' \
        --raw-output 2>/dev/null || true)
    if [ -n "$VNIC_ID" ] && [ "$VNIC_ID" != "null" ]; then
        PUBLIC_IP=$(oci_cli network vnic get \
            --vnic-id "$VNIC_ID" \
            --query 'data."public-ip"' \
            --raw-output 2>/dev/null || true)
    fi
    if [ -n "$PUBLIC_IP" ] && [ "$PUBLIC_IP" != "null" ]; then
        break
    fi
    sleep 5
done

if [ -z "$PUBLIC_IP" ] || [ "$PUBLIC_IP" = "null" ]; then
    echo "Instance has no public IP. Check subnet public IP settings in OCI." >&2
    exit 1
fi

echo "  Waiting for SSH at $PUBLIC_IP..."
for attempt in {1..40}; do
    if ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=5 \
        -i "$OCI_SSH_KEY" "$OCI_SSH_USER@$PUBLIC_IP" "true" 2>/dev/null; then
        break
    fi
    if [ "$attempt" -eq 40 ]; then
        echo "Timed out waiting for SSH." >&2
        echo "If you used Oracle Linux, rerun with OCI_SSH_USER=opc." >&2
        exit 1
    fi
    sleep 6
done

echo "  Installing systemd service..."
ssh -o StrictHostKeyChecking=accept-new -i "$OCI_SSH_KEY" "$OCI_SSH_USER@$PUBLIC_IP" \
    "sudo mkdir -p /home/$OCI_SSH_USER/$OCI_REMOTE_DIR && \
     sudo touch /var/log/dctrading.log && \
     sudo chown $OCI_SSH_USER:$OCI_SSH_USER /var/log/dctrading.log && \
     sudo chmod 644 /var/log/dctrading.log && \
     sudo tee /etc/systemd/system/$OCI_SERVICE_NAME.service >/dev/null <<'UNIT'
[Unit]
Description=DCTrading Bot
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$OCI_SSH_USER
WorkingDirectory=/home/$OCI_SSH_USER
ExecStart=/bin/bash -lc 'export BOT_INSTANCE=oci-arm && source /home/$OCI_SSH_USER/.env && /home/$OCI_SSH_USER/$OCI_REMOTE_DIR/dctrading -'
StandardOutput=append:/var/log/dctrading.log
StandardError=append:/var/log/dctrading.log
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT
     sudo systemctl daemon-reload && \
     sudo systemctl enable $OCI_SERVICE_NAME"

echo ""
echo "OCI instance ready."
echo ""
echo "Add these to your .env:"
echo "  CLOUD_TARGET=oci"
if [ -n "$OCI_REGION" ]; then
    echo "  OCI_REGION=$OCI_REGION"
fi
echo "  OCI_COMPARTMENT_OCID=$OCI_COMPARTMENT_OCID"
echo "  OCI_INSTANCE_OCID=$INSTANCE_ID"
echo "  OCI_SSH_HOST=$PUBLIC_IP"
echo "  OCI_SSH_USER=$OCI_SSH_USER"
echo "  OCI_SSH_KEY=$OCI_SSH_KEY"
echo "  OCI_REMOTE_DIR=$OCI_REMOTE_DIR"
echo "  OCI_SERVICE_NAME=$OCI_SERVICE_NAME"
echo ""
echo "Then deploy with:"
echo "  ./scripts/deploy-oci.sh"
