param(
  [int]$Port = 5000,
  [switch]$UseNodemon
)

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
  $pidInUse = $listener.OwningProcess
  Write-Host "[start-clean] Port $Port is in use by PID $pidInUse. Stopping it..."
  Stop-Process -Id $pidInUse -Force
}

if ($UseNodemon) {
  Write-Host "[start-clean] Starting backend with nodemon on port $Port..."
  nodemon server.js
} else {
  Write-Host "[start-clean] Starting backend with node on port $Port..."
  node server.js
}
