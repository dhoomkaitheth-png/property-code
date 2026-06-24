@echo off
echo Uttarakhand Real Estate - Backend Server
echo ========================================
cd /d "%~dp0"
set "PATH=%PATH%;%~dp0node\node-v20.17.0-win-x64"
cd backend
echo Starting API server on port 5000...
echo.
echo NOTE: Make sure PostgreSQL is running and configured in .env
echo.
npm run dev
if %errorlevel% neq 0 (
    echo.
    echo Backend failed to start. Press any key to exit...
    pause >nul
)