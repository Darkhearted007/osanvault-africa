#!/bin/bash

BASE="$HOME/osanvault"
RUNTIME="$BASE/runtime"
API_DIR="$BASE/apps/api"

source $RUNTIME/services.env

# -----------------------
# START DB
# -----------------------
start_db() {
  echo "⬡ DB starting..."

  if pg_isready -d $DB_NAME -q; then
    echo "✅ DB already running"
    return
  fi

  rm -f $DB_PATH/postmaster.pid 2>/dev/null
  pg_ctl -D $DB_PATH start > $RUNTIME/logs/db.log 2>&1

  for i in {1..20}; do
    if pg_isready -d $DB_NAME -q; then
      echo "✅ DB ready"
      return
    fi
    sleep 1
  done

  echo "❌ DB failed"
  exit 1
}

# -----------------------
# START REDIS
# -----------------------
start_redis() {
  echo "⬡ Redis starting..."

  redis-server --daemonize yes > $RUNTIME/logs/redis.log 2>&1
  sleep 1

  if redis-cli ping 2>/dev/null | grep -q PONG; then
    echo "✅ Redis ready"
  else
    echo "❌ Redis failed"
    exit 1
  fi
}

# -----------------------
# START API
# -----------------------
start_api() {
  echo "⬡ API starting..."

  pkill -f "tsx src/index" 2>/dev/null
  sleep 1

  cd $API_DIR || exit 1

  nohup ./node_modules/.bin/tsx src/index.ts > $RUNTIME/logs/api.log 2>&1 &
  echo $! > $RUNTIME/state/api.pid

  echo "⏳ Waiting API..."

  for i in {1..25}; do
    RESP=$(curl -s --max-time 2 http://localhost:$API_PORT/health)

    if echo "$RESP" | grep -q '"status":"ok"'; then
      echo "✅ API ready"
      return
    fi
    sleep 1
  done

  echo "❌ API failed"
  exit 1
}

# -----------------------
# STOP ALL
# -----------------------
stop_all() {
  echo "⏹ Stopping system..."

  pkill -f "tsx src/index" 2>/dev/null
  pkill postgres 2>/dev/null
  pkill redis-server 2>/dev/null

  rm -f $RUNTIME/state/*.pid

  echo "🌙 stopped cleanly"
}

# -----------------------
# STATUS
# -----------------------
status() {
  echo "📊 ÒsánVault Runtime Status"

  # API
  API_RESP=$(curl -s --max-time 2 http://localhost:$API_PORT/health)

  if echo "$API_RESP" | grep -q '"status":"ok"'; then
    echo "API ✔"
  else
    echo "API ❌"
  fi

  # DB
  pg_isready -d $DB_NAME -q && echo "DB ✔" || echo "DB ❌"

  # Redis
  redis-cli ping 2>/dev/null | grep -q PONG && echo "Redis ✔" || echo "Redis ❌"
}

# -----------------------
# MAIN
# -----------------------
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
    echo "Usage: engine.sh {start|stop|restart|status}"
    ;;
esac
