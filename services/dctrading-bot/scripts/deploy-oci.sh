#!/bin/bash
# Deploy trading bot to Oracle Cloud Infrastructure Ampere A1 in place.
# Builds ARM Linux binary, uploads it + .env, restarts systemd.
# Does NOT stop local bot or migrate checkpoints.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

OCI_SSH_HOST="${OCI_SSH_HOST:?Set OCI_SSH_HOST to the instance public IP or DNS}"
OCI_SSH_USER="${OCI_SSH_USER:-ubuntu}"
OCI_SSH_KEY="${OCI_SSH_KEY:-}"
OCI_REMOTE_DIR="${OCI_REMOTE_DIR:-.}"
OCI_SERVICE_NAME="${OCI_SERVICE_NAME:-dctrading}"
OCI_INSTANCE_OCID="${OCI_INSTANCE_OCID:-}"

ssh_opts=(-o StrictHostKeyChecking=accept-new -o LogLevel=ERROR)
if [ -n "$OCI_SSH_KEY" ]; then
    ssh_opts+=(-i "$OCI_SSH_KEY")
fi

oci_remote() {
    ssh "${ssh_opts[@]}" "$OCI_SSH_USER@$OCI_SSH_HOST" "$@"
}

upload() {
    scp "${ssh_opts[@]}" "$@" "$OCI_SSH_USER@$OCI_SSH_HOST:$OCI_REMOTE_DIR/"
}

start_oci_if_configured() {
    if [ -z "$OCI_INSTANCE_OCID" ]; then
        return
    fi
    if ! command -v oci >/dev/null 2>&1; then
        echo "OCI_INSTANCE_OCID is set but oci CLI is unavailable. Skipping instance start." >&2
        return
    fi

    echo "  Starting OCI instance if needed..."
    oci compute instance action --instance-id "$OCI_INSTANCE_OCID" --action START >/dev/null 2>&1 || true
    for attempt in {1..60}; do
        state=$(oci compute instance get --instance-id "$OCI_INSTANCE_OCID" --query 'data."lifecycle-state"' --raw-output 2>/dev/null || echo "")
        if [ "$state" = "RUNNING" ]; then
            return
        fi
        sleep 2
    done
    echo "  WARNING: OCI instance did not report RUNNING after waiting." >&2
}

wait_for_ssh() {
    echo "  Waiting for SSH at $OCI_SSH_HOST..."
    for attempt in {1..30}; do
        printf "    attempt %d/30...\r" "$attempt"
        if ssh -o ConnectTimeout=5 -o BatchMode=yes "${ssh_opts[@]}" "$OCI_SSH_USER@$OCI_SSH_HOST" "true" 2>/dev/null; then
            echo ""
            return
        fi
        sleep 5
    done
    echo ""
    echo "Timed out waiting for SSH. Check OCI security list/NSG allows TCP 22 from your IP." >&2
    exit 1
}

install_service() {
    oci_remote "sudo tee /etc/systemd/system/$OCI_SERVICE_NAME.service > /dev/null <<'EOF'
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
EOF
sudo systemctl daemon-reload
sudo systemctl enable '$OCI_SERVICE_NAME' >/dev/null"
}

cd "$PROJECT_DIR"

echo "Deploying to OCI Ampere A1..."
start_oci_if_configured
wait_for_ssh

echo "  Building ARM Linux binary..."
zig build -Doptimize=ReleaseFast -Dtarget=aarch64-linux
echo "  ARM Linux binary ready."

echo "  Ensuring remote directory and log file..."
oci_remote "mkdir -p '$OCI_REMOTE_DIR'; sudo touch /var/log/dctrading.log; sudo chown '$OCI_SSH_USER':'$OCI_SSH_USER' /var/log/dctrading.log; sudo chmod 644 /var/log/dctrading.log"

echo "  Stopping remote bot..."
oci_remote "sudo systemctl stop '$OCI_SERVICE_NAME' 2>/dev/null || true"

echo "  Uploading binary..."
oci_remote "chmod +w '$OCI_REMOTE_DIR/dctrading' 2>/dev/null || true"
upload zig-out/bin/dctrading
oci_remote "chmod +x '$OCI_REMOTE_DIR/dctrading'"

if [ -f "$PROJECT_DIR/.env" ]; then
    echo "  Uploading .env..."
    upload "$PROJECT_DIR/.env"
fi

echo "  Updating systemd service..."
install_service

echo "  Starting bot on OCI..."
oci_remote "sudo systemctl start '$OCI_SERVICE_NAME'"

echo "  Waiting for bot to bootstrap..."
sleep 5
for i in {1..20}; do
    printf "    checking %d/20...\r" "$i"
    if oci_remote "sudo systemctl is-active '$OCI_SERVICE_NAME' >/dev/null 2>&1"; then
        echo ""
        break
    fi
    sleep 1
done

echo ""
echo "  --- Recent logs ---"
oci_remote "sudo journalctl -u '$OCI_SERVICE_NAME' -n 20 --no-pager"

echo ""
echo "Deployed to OCI Ampere A1"
