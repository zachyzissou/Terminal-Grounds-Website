#!/usr/bin/env bash
set -euo pipefail

# Simple helper to build and (re)start the site on an Unraid box.
# Usage: ./scripts/deploy-unraid.sh [HOST_PORT]

HOST_PORT=${1:-2161}
export HOST_PORT

echo "[deploy] Using HOST_PORT=$HOST_PORT"
if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
else
  COMPOSE="docker-compose"
fi
$COMPOSE up -d --build --remove-orphans

echo "[deploy] Waiting for health..."
for i in {1..40}; do
  status=$(docker inspect -f '{{.State.Health.Status}}' terminal-grounds-website 2>/dev/null || echo 'unknown')
  echo "[deploy] Attempt $i status: $status"
  if [ "$status" = "healthy" ]; then
    echo "[deploy] Healthy. Visit http://<unraid-host>:${HOST_PORT}/"
    exit 0
  fi
  sleep 3
done

echo "[deploy] Failed to become healthy. Recent logs:"
docker logs --tail 200 terminal-grounds-website || true
exit 1
