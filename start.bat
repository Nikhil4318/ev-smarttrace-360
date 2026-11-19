@echo off
echo ==================================================
echo      EV SMARTTRACE 360 - FULL STACK PLATFORM
echo      Drive Smart. Charge Smart. Travel Safe.
echo ==================================================

echo.
echo [1/2] Starting FastAPI Backend on http://localhost:8000...
start cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Vite Frontend on http://localhost:5173...
cd /d %~dp0frontend
npm run dev
