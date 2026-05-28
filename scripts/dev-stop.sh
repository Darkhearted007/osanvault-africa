#!/bin/bash

echo "⏹ Stopping ÒsánVault Africa Stack..."

# Stop API
if [ -f ~/osanvault.api.pid ]; then
  kill $(cat ~/osanvault.api.pid) 2>/dev/null
  rm ~/osanvault.api.pid
fi
pkill -f "tsx src/index" 2>/dev/null
echo "✅ API stopped"

# Stop Redis
redis-cli shutdown 2>/dev/null
echo "✅ Redis stopped"

# Stop PostgreSQL
pg_ctl -D $PREFIX/var/lib/postgresql stop -m fast 2>/dev/null
echo "✅ PostgreSQL stopped"

echo "🌙 Stack stopped cleanly"
