@echo off
cd /d "%~dp0"
set "PATH=%PATH%;%~dp0node\node-v20.17.0-win-x64"
cd mobile
echo Installing mobile dependencies (first time only)...
if not exist node_modules (
    npm install
)
echo Starting Uttarakhand Real Estate Mobile App...
echo.
echo Scan the QR code with Expo Go app on your phone
echo.
npx expo start
pause