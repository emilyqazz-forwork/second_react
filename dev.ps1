<<<<<<< Updated upstream
# 백엔드(FastAPI)와 프론트엔드(React)를 동시에 띄워주는 개발용 실행 스크립트

# 실행 시 포트/주소를 바꿀 수 있는 매개변수 (기본값 설정)
=======
//개발 실행을 편하게 해주는 PowerShell 스크립트
//삭제해도 상관없음.

>>>>>>> Stashed changes
param(
  [int]$ApiPort = 8000,       # FastAPI 백엔드 포트
  [int]$WebPort = 5173,       # React 프론트엔드 포트 (Vite 기본값)
  [string]$HostAddress = "127.0.0.1"  # 로컬 전용 (외부 접근 차단)
)

# 오류 발생 시 즉시 중단
$ErrorActionPreference = "Stop"

Write-Host "Starting API on http://$HostAddress`:$ApiPort"
Write-Host "Starting React app on http://$HostAddress`:$WebPort"
Write-Host ""
# GOOGLE_API_KEY가 없으면 AI 기능만 비활성화됨 (앱 자체는 실행됨)
Write-Host "If AI chat/hints are needed, set env var GOOGLE_API_KEY first:"
Write-Host '  $env:GOOGLE_API_KEY="YOUR_KEY_HERE"'
Write-Host ""

# uvicorn으로 FastAPI 서버 실행 (--reload: 코드 변경 시 자동 재시작)
$apiArgs = @(
  "-m","uvicorn",
  "main:app",
  "--host",$HostAddress,
  "--port",$ApiPort,
  "--reload"
)

# 백엔드/프론트엔드를 별도 창으로 동시에 실행 (서로 독립적으로 동작)
Start-Process -FilePath "python" -ArgumentList $apiArgs -WindowStyle Normal
Start-Process -FilePath "npm.cmd" -ArgumentList @("run","dev","--","--host",$HostAddress,"--port",$WebPort) -WorkingDirectory $PSScriptRoot -WindowStyle Normal

Write-Host ""
Write-Host "Open: http://$HostAddress`:$WebPort"