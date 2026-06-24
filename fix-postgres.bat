@echo off
echo ============================================
echo  Fixing PostgreSQL Authentication
echo ============================================
echo.
echo This script changes PostgreSQL to 'trust' mode
echo so no password is required for local connections.
echo.
echo MUST be run as Administrator!
echo.

:: Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Please run this file as Administrator!
    echo    Right-click ^> "Run as Administrator"
    pause
    exit /b 1
)

set "PGCONF=C:\Program Files\PostgreSQL\18\data\pg_hba.conf"

:: Check if file exists
if not exist "%PGCONF%" (
    echo ❌ Could not find: %PGCONF%
    echo    Check your PostgreSQL installation path.
    pause
    exit /b 1
)

echo ✅ Found PostgreSQL config file

:: Backup original
copy "%PGCONF%" "%PGCONF%.backup" >nul
echo ✅ Backup created: pg_hba.conf.backup

:: Replace scram-sha-256 with trust
powershell -Command "(Get-Content '%PGCONF%') -replace 'scram-sha-256', 'trust' | Set-Content '%PGCONF%'"
echo ✅ Changed authentication from scram-sha-256 to trust

:: Restart PostgreSQL
echo.
echo Restarting PostgreSQL service...
net stop postgresql-x64-18 2>nul
net start postgresql-x64-18

if %errorLevel% equ 0 (
    echo.
    echo ✅ PostgreSQL restarted successfully with trust auth!
    echo ✅ No password needed anymore!
    echo.
    echo Now run: .\start-backend.bat
) else (
    echo.
    echo ⚠️ Could not restart PostgreSQL automatically.
    echo    Please restart your computer, then run: .\start-backend.bat
)

pause