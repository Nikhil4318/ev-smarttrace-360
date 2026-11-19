@echo off
title Publishing EV SmartTrace 360 to GitHub...
color 0A
echo ========================================================
echo   EV SMARTTRACE 360 - GITHUB AUTOMATED DEPLOYMENT
echo   Repository: https://github.com/Gnanendra777/EV-SmartTrace-360.git
echo ========================================================
echo.

set "PATH=C:\Users\dell\AppData\Local\GitHubDesktop\app-3.4.20\resources\app\git\cmd;%PATH%"
cd /d "%~dp0"

echo 1. Verifying Git Status and Commit History...
git log -1 --oneline
echo.

echo 2. Pushing main branch to GitHub...
echo (If prompted, click 'Sign in with your browser' to authorize)
echo.

git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo   [SUCCESS] All code uploaded to GitHub successfully!
    echo   View online: https://github.com/Gnanendra777/EV-SmartTrace-360
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   [NOTE] If GitHub asks for authentication:
    echo   Use GitHub Desktop or Personal Access Token (PAT).
    echo ========================================================
)

echo.
pause
