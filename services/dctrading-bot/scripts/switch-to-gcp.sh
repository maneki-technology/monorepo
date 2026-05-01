#!/bin/bash
# Switch trading bot from local to GCP Tokyo
# Builds Linux binary, uploads, and starts on GCP
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ZONE="asia-northeast1-b"
INSTANCE="dctrading-asia"

cd "$PROJECT_DIR"

echo "🔄 Switching to GCP Tokyo..."

# Stop local bot
echo "  Stopping local bot..."
tmux send-keys -t trading C-c 2>/dev/null || true
sleep 3

# Build Linux binary
echo "  Building Linux binary..."
zig build -Doptimize=ReleaseFast -Dtarget=x86_64-linux
echo "  Linux binary ready."

# Start GCP instance
echo "  Starting GCP instance..."
gcloud compute instances start $INSTANCE --zone=$ZONE --quiet

# Wait for SSH
echo "  Waiting for instance..."
sleep 20

# Upload binary + checkpoint
echo "  Uploading binary..."
gcloud compute ssh $INSTANCE --zone=$ZONE --command="sudo systemctl stop dctrading 2>/dev/null; chmod +w ~/dctrading 2>/dev/null" 2>/dev/null || true
gcloud compute scp zig-out/bin/dctrading $INSTANCE:~/dctrading --zone=$ZONE
gcloud compute ssh $INSTANCE --zone=$ZONE --command="chmod +x ~/dctrading"
if [ -f dctrading.checkpoint ]; then
    echo "  Uploading checkpoint..."
    gcloud compute scp dctrading.checkpoint $INSTANCE:~/dctrading.checkpoint --zone=$ZONE
fi
echo "  Upload complete."

# Start bot on GCP
echo "  Starting bot on GCP..."
gcloud compute ssh $INSTANCE --zone=$ZONE --command="sudo systemctl start dctrading" 2>/dev/null


# Verify
sleep 5
echo "  Checking GCP bot..."
gcloud compute ssh $INSTANCE --zone=$ZONE --command="sudo journalctl -u dctrading -n 5 --no-pager" 2>/dev/null

echo "✅ Bot running on GCP Tokyo"
