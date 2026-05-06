# 개발 실행을 편하게 해주는 PowerShell 스크립트

param(
  [int]$ApiPort = 8000,
  [int]$WebPort = 5173,
  [string]$HostAddress = "127.0.0.1"
)

$ErrorActionPreference = "Stop"

Write-Host "Starting API on http://$HostAddress`:$ApiPort"
Write-Host "Starting React app on http://$HostAddress`:$WebPort"

$apiArgs = @(
  "-m","uvicorn",
  "main:app",
  "--host",$HostAddress,
  "--port",$ApiPort,
  "--reload"
)

Start-Process -FilePath "python" -ArgumentList $apiArgs -WindowStyle Normal
Start-Process -FilePath "npm.cmd" -ArgumentList @("run","dev","--","--host",$HostAddress,"--port",$WebPort) -WorkingDirectory $PSScriptRoot -WindowStyle Normal

Write-Host "Open: http://$HostAddress`:$WebPort"