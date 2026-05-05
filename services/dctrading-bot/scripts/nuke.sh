#!/bin/bash
# Nuke all trading state: Turso tables, checkpoint, Alpaca positions
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

source "$PROJECT_DIR/.env"

TURSO_HOST=$(echo "$TURSO_URL" | sed 's|libsql://||; s|https://||')

echo "⚠️  This will destroy ALL trading data. Press Ctrl-C to cancel."
sleep 3

echo "  Dropping Turso tables..."
curl -s "https://$TURSO_HOST/v2/pipeline" \
  -H "Authorization: Bearer $TURSO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requests": [
    {"type": "execute", "stmt": {"sql": "DROP TABLE IF EXISTS account_ledger"}},
    {"type": "execute", "stmt": {"sql": "DROP TABLE IF EXISTS trade_events"}},
    {"type": "execute", "stmt": {"sql": "DROP TABLE IF EXISTS positions"}},
    {"type": "execute", "stmt": {"sql": "DROP TABLE IF EXISTS transfers"}},
    {"type": "execute", "stmt": {"sql": "DROP TABLE IF EXISTS accounts"}},
    {"type": "execute", "stmt": {"sql": "DROP TABLE IF EXISTS equity_log"}},
    {"type": "execute", "stmt": {"sql": "DROP TABLE IF EXISTS checkpoint_backups"}},
    {"type": "execute", "stmt": {"sql": "DROP TABLE IF EXISTS bot_status"}}
  ]}' > /dev/null
echo "  ✓ Tables dropped"

echo "  Deleting checkpoint state..."
rm -f "$PROJECT_DIR"/dctrading.checkpoint "$PROJECT_DIR"/dctrading.checkpoint.tmp "$PROJECT_DIR"/dctrading.checkpoint.bak.*
echo "  ✓ Checkpoint state deleted"

echo "  Closing Alpaca positions..."
curl -s -X DELETE "https://paper-api.alpaca.markets/v2/positions" \
  -H "APCA-API-KEY-ID: $ALPACA_API_KEY" \
  -H "APCA-API-SECRET-KEY: $ALPACA_API_SECRET" > /dev/null 2>&1
echo "  ✓ Alpaca positions closed"

echo "🔥 All nuked. Ready for fresh start."
