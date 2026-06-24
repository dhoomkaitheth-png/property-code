@echo off
setlocal enabledelayedexpansion

echo ============================================
echo  Uttarakhand Real Estate Platform - Setup
echo ============================================
echo.

:: Check if running as admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [WARNING] Some installations may need Administrator privileges.
    echo           Right-click and select "Run as Administrator" if issues occur.
    echo.
)

:: ============================================
:: Step 1: Install Node.js
:: ============================================
echo [1/5] Checking Node.js...
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo Installing Node.js via winget...
    winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements
    if !errorLevel! equ 0 (
        echo [OK] Node.js installed successfully!
    ) else (
        echo [FAILED] Could not install Node.js automatically.
        echo Please download from: https://nodejs.org (LTS version)
        pause
        exit /b 1
    )
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    echo [OK] Node.js found: !NODE_VER!
)

:: Refresh PATH
call refreshenv >nul 2>&1
if %errorLevel% neq 0 (
    set "PATH=%PATH%;C:\Program Files\nodejs"
)

:: ============================================
:: Step 2: Install PostgreSQL
:: ============================================
echo.
echo [2/5] Checking PostgreSQL...
where psql >nul 2>&1
if %errorLevel% neq 0 (
    echo PostgreSQL is not installed.
    echo.
    echo Would you like to install PostgreSQL via winget? (Y/N)
    set /p INSTALL_PG="Choice: "
    if /i "!INSTALL_PG!"=="Y" (
        echo Installing PostgreSQL...
        echo NOTE: PostgreSQL installation may need manual configuration.
        echo You will be prompted to set a password during installation.
        echo.
        winget install "PostgreSQL 16" --silent --accept-package-agreements 2>nul
        if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" (
            set "PATH=!PATH!;C:\Program Files\PostgreSQL\16\bin"
            echo [OK] PostgreSQL installed!
        ) else if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" (
            set "PATH=!PATH!;C:\Program Files\PostgreSQL\15\bin"
            echo [OK] PostgreSQL installed!
        ) else (
            echo [WARNING] PostgreSQL may have been installed in a different location.
            echo Search for psql.exe and add its folder to PATH manually.
        )
    ) else (
        echo Skipping PostgreSQL installation.
        echo Please install manually from: https://www.postgresql.org/download/windows/
    )
) else (
    for /f "tokens=*" %%i in ('psql --version') do set PG_VER=%%i
    echo [OK] PostgreSQL found: !PG_VER!
)

:: ============================================
:: Step 3: Install Backend Dependencies
:: ============================================
echo.
echo [3/5] Installing backend dependencies...
cd /d "%~dp0backend"
if exist node_modules (
    echo Backend dependencies already installed.
) else (
    call npm install
    if !errorLevel! equ 0 (
        echo [OK] Backend dependencies installed!
    ) else (
        echo [FAILED] npm install failed.
        pause
        exit /b 1
    )
)

:: ============================================
:: Step 4: Setup Database
:: ============================================
echo.
echo [4/5] Database Setup...
echo.
echo To set up the database, you need your PostgreSQL password.
echo If you haven't set one, the default is usually: postgres
echo.
set /p PG_PASS="Enter PostgreSQL password (default: postgres): "
if "!PG_PASS!"=="" set PG_PASS=postgres

:: Update .env file with password
cd /d "%~dp0backend"
if exist .env (
    echo Updating database password in .env...
    powershell -Command "(Get-Content .env) -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=!PG_PASS!' | Set-Content .env"
) else (
    echo DB_PASSWORD=!PG_PASS! > .env
)

:: Try to create database and run schema
echo Creating database and tables...
psql -U postgres -c "CREATE DATABASE property_portal;" 2>nul
if !errorLevel! equ 0 (
    echo [OK] Database created!
) else (
    echo Database may already exist, continuing...
)

cd /d "%~dp0database"
psql -U postgres -d property_portal -f schema.sql
if !errorLevel! equ 0 (
    echo [OK] Schema created!
) else (
    echo [FAILED] Schema creation failed. Check PostgreSQL connection.
)

psql -U postgres -d property_portal -f seed.sql
if !errorLevel! equ 0 (
    echo [OK] Seed data loaded! (13 districts + tehsils + villages)
) else (
    echo [WARNING] Seed data may have partially loaded.
)

:: ============================================
:: Step 5: Install Mobile Dependencies
:: ============================================
echo.
echo [5/5] Installing mobile app dependencies...
cd /d "%~dp0mobile"
if exist node_modules (
    echo Mobile dependencies already installed.
) else (
    call npm install
    if !errorLevel! equ 0 (
        echo [OK] Mobile dependencies installed!
    ) else (
        echo [FAILED] npm install failed for mobile.
        pause
        exit /b 1
    )
)

:: ============================================
:: Done!
:: ============================================
echo.
echo ============================================
echo  Setup Complete!
echo ============================================
echo.
echo To start the application:
echo.
echo 1. Start Backend Server:
echo    cd backend
echo    npm run dev
echo.
echo 2. In a NEW terminal, start Mobile App:
echo    cd mobile
echo    npx expo start
echo.
echo 3. Scan QR code with Expo Go app (Android) 
echo    or press 'a' for Android emulator
echo.
echo Admin Login Credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo Default PostgreSQL Password used: !PG_PASS!
echo (Change in backend\.env if different)
echo.
pause