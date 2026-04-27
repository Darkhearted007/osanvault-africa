#!/bin/bash

echo "🌍 Starting ÒsánVault Africa Development Stack..."

API_DIR="/data/data/com.termux/files/home/osanvault/apps/api"
TSX="$API_DIR/node_modules/.bin/tsx"

# 1. PostgreSQL
echo "⬡ Starting PostgreSQL..."
pg_ctl -D $PREFIX/var/lib/postgresql -l $PREFIX/var/log/postgresql.log start 2>/dev/null
sleep 2

if pg_isready -U osanvault -d osanvault_db -q; then
  echo "✅ PostgreSQL ready"
else
  echo "❌ PostgreSQL failed"
  exit 1
fi

# 2. Redis
echo "⬡ Starting Redis..."
redis-server --daemonize yes --logfile $PREFIX/var/log/redis.log 2>/dev/null
sleep 1

if redis-cli ping | grep -q PONG; then
  echo "✅ Redis ready"
else
  echo "❌ Redis failed"
  exit 1
fi

# 3. API
echo "⬡ Starting ÒsánVault API..."
pkill -f "tsx src/index" 2>/dev/null
sleep 1

cd "$API_DIR"
nohup "$TSX" src/index.ts < /dev/null > ~/api.log 2>&1 &
echo $! > ~/osanvault.api.pid

# Retry health check up to 10 times
echo "⬡ Waiting for API..."
for i in {1..10}; do
  sleep 2
  if curl -s http://localhost:3001/health | grep -q '"api":"ok"'; then
    echo "✅ API ready at http://localhost:3001"
    break
  fi
  if [ $i -eq 10 ]; then
    echo "❌ API failed — check ~/api.log"
    exit 1
  fi
done

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ÒsánVault Africa Stack is LIVE 🚀    ║"
echo "╠════════════════════════════════════════╣"
echo "║  API      → http://localhost:3001      ║"
echo "║  Frontend → http://localhost:5173      ║"
echo "║  Health   → /health                   ║"
echo "║  Logs     → ~/api.log                 ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "▶ Start frontend: cd ~/osanvault/apps/web && pnpm dev"
