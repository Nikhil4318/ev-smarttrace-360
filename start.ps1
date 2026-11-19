# EV SmartTrace 360 - Unified Launcher
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "     EV SMARTTRACE 360 - FULL STACK PLATFORM      " -ForegroundColor Green
Write-Host "     Drive Smart. Charge Smart. Travel Safe.      " -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Start FastAPI Backend in background
Write-Host "`n[1/2] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Cyan
$backendJob = Start-Process python -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload" -WorkingDirectory "$PSScriptRoot\backend" -PassThru

Start-Sleep -Seconds 3

# 2. Start Vite Frontend
Write-Host "[2/2] Starting Vite Frontend on http://localhost:5173..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\frontend"
npm run dev
