#!/usr/bin/env bash
set -euo pipefail

PORT=${1:-2161}
export HOST_PORT="$PORT"

echo "[build-local] Using HOST_PORT=$HOST_PORT"
if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
else
  COMPOSE="docker-compose"
fi

$COMPOSE up -d --build --remove-orphans

echo "[build-local] Waiting for health..."
for i in {1..40}; do
  if curl -fsS "http://127.0.0.1:${HOST_PORT}/health" >/dev/null; then
    echo "[build-local] Healthy at http://localhost:${HOST_PORT}/"
    exit 0
  fi
  echo "[build-local] Waiting ($i/40)..."
  sleep 3
done

echo "[build-local] Container did not become healthy. Recent logs:"
docker logs --tail 200 terminal-grounds-website || true
exit 1
