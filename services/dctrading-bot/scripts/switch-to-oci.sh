#!/bin/bash
# Switch trading bot from local to Oracle Cloud Infrastructure Ampere A1.
# Builds ARM Linux binary, uploads it with checkpoint state, and starts systemd.
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

echo "Switching to OCI Ampere A1..."
stop_local_bot

echo "  Building ARM Linux binary..."
zig build -Doptimize=ReleaseFast -Dtarget=aarch64-linux
echo "  ARM Linux binary ready."

start_oci_if_configured
wait_for_ssh

echo "  Ensuring remote directory and log file..."
oci_remote "mkdir -p '$OCI_REMOTE_DIR'; sudo touch /var/log/dctrading.log; sudo chown '$OCI_SSH_USER':'$OCI_SSH_USER' /var/log/dctrading.log; sudo chmod 644 /var/log/dctrading.log"

echo "  Uploading binary..."
oci_remote "sudo systemctl stop '$OCI_SERVICE_NAME' 2>/dev/null || true; chmod +w '$OCI_REMOTE_DIR/dctrading' 2>/dev/null || true"
upload zig-out/bin/dctrading
oci_remote "chmod +x '$OCI_REMOTE_DIR/dctrading'"

if [ -f "$PROJECT_DIR/.env" ]; then
    echo "  Uploading .env..."
    upload "$PROJECT_DIR/.env"
fi

shopt -s nullglob
checkpoint_files=(dctrading.checkpoint dctrading.checkpoint.bak.*)
if [ ${#checkpoint_files[@]} -gt 0 ]; then
    echo "  Uploading checkpoint state..."
    oci_remote "rm -f '$OCI_REMOTE_DIR/dctrading.checkpoint.tmp' '$OCI_REMOTE_DIR'/dctrading.checkpoint.bak.*"
    upload "${checkpoint_files[@]}"
else
    echo "  No local checkpoint state to upload; bot can restore from Turso if configured."
fi

echo "  Updating systemd service..."
install_service

echo "  Starting bot on OCI..."
oci_remote "sudo systemctl start '$OCI_SERVICE_NAME'"

sleep 5
echo "  Checking OCI bot..."
oci_remote "sudo journalctl -u '$OCI_SERVICE_NAME' -n 10 --no-pager"

echo "Bot running on OCI Ampere A1"
