#!/bin/bash

BASE="$HOME/osanvault"
API_DIR="$BASE/apps/api"
PID_FILE="$BASE/osanvault.api.pid"
DB_NAME="osanvault_db"

# ----------------------------
# PostgreSQL
# ----------------------------
start_db() {
  echo "⬡ Starting PostgreSQL..."

  if pg_isready -q; then
    echo "✅ PostgreSQL already running"
    return
  fi

  rm -f $PREFIX/var/lib/postgresql/postmaster.pid 2>/dev/null

  pg_ctl -D $PREFIX/var/lib/postgresql start 2>/dev/null

  for i in {1..25}; do
    if pg_isready -q; then
      echo "✅ PostgreSQL ready"
      return
    fi
    sleep 1
  done

  echo "❌ PostgreSQL failed to start"
  exit 1
}

# ----------------------------
# Redis
# ----------------------------
start_redis() {
  echo "⬡ Starting Redis..."

  redis-server --daemonize yes 2>/dev/null
  sleep 1

  if redis-cli ping 2>/dev/null | grep -q PONG; then
    echo "✅ Redis ready"
  else
    echo "❌ Redis failed"
    exit 1
  fi
}

# ----------------------------
# API
# ----------------------------
start_api() {
  echo "⬡ Starting API..."

  pkill -f "tsx src/index" 2>/dev/null
  sleep 1

  cd $API_DIR || exit 1

  nohup ./node_modules/.bin/tsx src/index.ts > ~/api.log 2>&1 &
  echo $! > $PID_FILE

  echo "⏳ Waiting for API..."

  for i in {1..25}; do
    RESPONSE=$(curl -s --max-time 2 http://localhost:3001/health)

    if echo "$RESPONSE" | grep -q '"status":"ok"'; then
      echo "✅ API ready"
      return
    fi

    sleep 1
  done

  echo "❌ API failed to become ready"
  exit 1
}

# ----------------------------
# STOP ALL
# ----------------------------
stop_all() {
  echo "⏹ Stopping ÒsánVault..."

  pkill -f "tsx src/index" 2>/dev/null
  pkill -f postgres 2>/dev/null
  pkill -f redis-server 2>/dev/null

  rm -f $PID_FILE

  echo "🌙 Stopped cleanly"
}

# ----------------------------
# STATUS
# ----------------------------
status() {
  echo "📊 ÒsánVault Status"

  # API
  RESPONSE=$(curl -s --max-time 2 http://localhost:3001/health)
  if echo "$RESPONSE" | grep -q '"status":"ok"'; then
    echo "API ✔"
  else
    echo "API ❌"
  fi

  # DB
  if pg_isready -q; then
    echo "DB ✔"
  else
    echo "DB ❌"
  fi

  # Redis
  if redis-cli ping 2>/dev/null | grep -q PONG; then
    echo "Redis ✔"
  else
    echo "Redis ❌"
  fi
}

# ----------------------------
# MAIN COMMANDS
# ----------------------------
case "$1" in
  start)
    start_db
    start_redis
    start_api
    ;;
  stop)
    stop_all
    ;;
  restart)
    stop_all
    sleep 2
    start_db
    start_redis
    start_api
    ;;
  status)
    status
    ;;
  *)
    echo "Usage: osanvaultctl {start|stop|restart|status}"
    ;;
esac
