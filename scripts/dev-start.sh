#!/bin/bash

echo "🌍 Starting ÒsánVault Africa Development Stack..."

# 1. PostgreSQL
echo "⬡ Starting PostgreSQL..."
pg_ctl -D $PREFIX/var/lib/postgresql -l $PREFIX/var/log/postgresql.log start 2>/dev/null
sleep 2

# Check postgres
if pg_isready -U osanvault -d osanvault_db -q; then
  echo "✅ PostgreSQL ready"
else
  echo "❌ PostgreSQL failed — check $PREFIX/var/log/postgresql.log"
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
cd /data/data/com.termux/files/home/osanvault/apps/api
nohup ./node_modules/.bin/tsx src/index.ts < /dev/null > ~/api.log 2>&1 &
echo $! > ~/osanvault.api.pid
sleep 8

if curl -s http://localhost:3001/health | grep -q '"api":"ok"'; then
  echo "✅ API ready at http://localhost:3001"
else
  echo "❌ API failed — check ~/api.log"
  exit 1
fi

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
