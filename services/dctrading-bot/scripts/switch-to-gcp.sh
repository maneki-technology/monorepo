#!/bin/bash
# Switch trading bot from local to GCP Tokyo.
# Builds Linux binary, uploads, and starts on GCP.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

GCP_ZONE="${GCP_ZONE:-asia-northeast1-b}"
GCP_INSTANCE="${GCP_INSTANCE:-dctrading-asia}"
GCP_REMOTE_DIR="${GCP_REMOTE_DIR:-.}"
GCP_SERVICE_NAME="${GCP_SERVICE_NAME:-dctrading}"

if ! command -v gcloud >/dev/null 2>&1; then
    echo "gcloud CLI not found. Install it and authenticate first." >&2
    exit 1
fi

cd "$PROJECT_DIR"

echo "🔄 Switching to GCP Tokyo..."

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

# Build Linux binary
echo "  Building Linux binary..."
zig build -Doptimize=ReleaseFast -Dtarget=x86_64-linux
echo "  Linux binary ready."

# Start GCP instance
echo "  Starting GCP instance..."
gcloud compute instances start "$GCP_INSTANCE" --zone="$GCP_ZONE" --quiet

# Wait for SSH
echo "  Waiting for instance..."
for attempt in {1..30}; do
    if gcloud compute ssh "$GCP_INSTANCE" --zone="$GCP_ZONE" --command="true" 2>/dev/null; then
        break
    fi
    if [ "$attempt" -eq 30 ]; then
        echo "Timed out waiting for SSH." >&2
        exit 1
    fi
    sleep 5
done

# Upload binary + checkpoint state
echo "  Ensuring remote directory exists..."
gcloud compute ssh "$GCP_INSTANCE" --zone="$GCP_ZONE" --command="mkdir -p '$GCP_REMOTE_DIR'" 2>/dev/null || true

echo "  Uploading binary..."
gcloud compute ssh "$GCP_INSTANCE" --zone="$GCP_ZONE" --command="sudo systemctl stop '$GCP_SERVICE_NAME' 2>/dev/null; chmod +w '$GCP_REMOTE_DIR/dctrading' 2>/dev/null" 2>/dev/null || true
gcloud compute scp zig-out/bin/dctrading "$GCP_INSTANCE:$GCP_REMOTE_DIR/dctrading" --zone="$GCP_ZONE"
gcloud compute ssh "$GCP_INSTANCE" --zone="$GCP_ZONE" --command="chmod +x '$GCP_REMOTE_DIR/dctrading'"

if [ -f "$PROJECT_DIR/.env" ]; then
    echo "  Uploading .env..."
    gcloud compute scp "$PROJECT_DIR/.env" "$GCP_INSTANCE:$GCP_REMOTE_DIR/.env" --zone="$GCP_ZONE" 2>/dev/null || true
fi

shopt -s nullglob
checkpoint_files=(dctrading.checkpoint dctrading.checkpoint.bak.*)
if [ ${#checkpoint_files[@]} -gt 0 ]; then
    echo "  Uploading checkpoint state..."
    gcloud compute ssh "$GCP_INSTANCE" --zone="$GCP_ZONE" --command="rm -f '$GCP_REMOTE_DIR'/dctrading.checkpoint.tmp '$GCP_REMOTE_DIR'/dctrading.checkpoint.bak.*" 2>/dev/null || true
    gcloud compute scp "${checkpoint_files[@]}" "$GCP_INSTANCE:$GCP_REMOTE_DIR/" --zone="$GCP_ZONE"
else
    echo "  No local checkpoint state to upload; bot can restore from Turso if configured."
fi
echo "  Upload complete."

# Start bot on GCP
echo "  Starting bot on GCP..."
gcloud compute ssh "$GCP_INSTANCE" --zone="$GCP_ZONE" --command="sudo systemctl start '$GCP_SERVICE_NAME'" 2>/dev/null

# Verify
sleep 5
echo "  Checking GCP bot..."
gcloud compute ssh "$GCP_INSTANCE" --zone="$GCP_ZONE" --command="sudo journalctl -u '$GCP_SERVICE_NAME' -n 5 --no-pager" 2>/dev/null

echo "✅ Bot running on GCP Tokyo"
