Param(
  [int]$Port = 2161,
  [int]$Retries = 40,
  [int]$DelaySeconds = 3
)

$ErrorActionPreference = 'Stop'
Write-Host "[build-local] Using HOST_PORT=$Port"
$env:HOST_PORT = "$Port"

# Detect Compose
function Get-ComposeCmd {
  try {
    docker compose version | Out-Null
    return 'docker compose'
  } catch {
    return 'docker-compose'
  }
}

$compose = Get-ComposeCmd
Write-Host "[build-local] Compose: $compose"

& $compose up -d --build --remove-orphans

# Wait for health
for ($i = 1; $i -le $Retries; $i++) {
  try {
    $resp = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/health" -UseBasicParsing -TimeoutSec 3
    if ($resp.StatusCode -eq 200) {
      Write-Host "[build-local] Healthy at http://localhost:$Port/"
      exit 0
    }
  } catch {
    # ignore
  }
  Write-Host "[build-local] Waiting ($i/$Retries)..."
  Start-Sleep -Seconds $DelaySeconds
}

Write-Warning "[build-local] Container did not become healthy. Recent logs:"
docker logs --tail 200 terminal-grounds-website | Write-Output
exit 1
