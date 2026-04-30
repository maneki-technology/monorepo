#!/bin/bash
# Switch trading bot from GCP Tokyo to local
# Builds macOS binary and starts locally
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ZONE="asia-northeast1-b"
INSTANCE="dctrading-asia"

cd "$PROJECT_DIR"

echo "🔄 Switching to local..."

# Stop bot on GCP
echo "  Stopping GCP bot..."
gcloud compute ssh $INSTANCE --zone=$ZONE --command="sudo systemctl stop dctrading" 2>/dev/null || true

# Stop GCP instance
echo "  Stopping GCP instance..."
gcloud compute instances stop $INSTANCE --zone=$ZONE --quiet &

# Build macOS binary
echo "  Building macOS binary..."
zig build -Doptimize=ReleaseFast
echo "  macOS binary ready."

# Start local bot
echo "  Starting local bot..."
tmux has-session -t trading 2>/dev/null || tmux new-session -d -s trading
tmux send-keys -t trading "source $PROJECT_DIR/.env && cd $PROJECT_DIR && ./zig-out/bin/dctrading -" Enter

sleep 8
echo "  Checking local bot..."
tmux capture-pane -t trading -p -S -5 | grep -v "^$" | tail -3

echo "✅ Bot running locally"
