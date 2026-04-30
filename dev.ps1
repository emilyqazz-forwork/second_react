param(
  [int]$ApiPort = 8000,
  [int]$WebPort = 5173,
  [string]$HostAddress = "127.0.0.1"
)

$ErrorActionPreference = "Stop"

Write-Host "Starting API on http://$HostAddress`:$ApiPort"
Write-Host "Starting React app on http://$HostAddress`:$WebPort"
Write-Host ""
Write-Host "If AI chat/hints are needed, set env var GOOGLE_API_KEY first:"
Write-Host '  $env:GOOGLE_API_KEY="YOUR_KEY_HERE"'
Write-Host ""

$apiArgs = @(
  "-m","uvicorn",
  "main:app",
  "--host",$HostAddress,
  "--port",$ApiPort,
  "--reload"
)

Start-Process -FilePath "python" -ArgumentList $apiArgs -WindowStyle Normal
Start-Process -FilePath "npm.cmd" -ArgumentList @("run","dev","--","--host",$HostAddress,"--port",$WebPort) -WorkingDirectory $PSScriptRoot -WindowStyle Normal

Write-Host ""
Write-Host "Open: http://$HostAddress`:$WebPort"
