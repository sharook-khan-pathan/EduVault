@echo off
setlocal enabledelayedexpansion
title EduVault - Setup Script

echo ============================================================
echo   EduVault - College Material Management System Setup
echo ============================================================
echo.

REM ===== CHECK NODE.JS =====
set NODE_PATH=C:\Program Files\nodejs
if exist "%NODE_PATH%\node.exe" (
    echo [OK] Node.js found at %NODE_PATH%
    set PATH=%NODE_PATH%;%PATH%
) else (
    echo [ERROR] Node.js not found. Download from https://nodejs.org
    pause & exit /b 1
)

REM ===== CHECK JAVA =====
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] Java not found on PATH.
    echo        Download Java 17 from: https://adoptium.net/
    echo        After installing, re-run this script.
    echo.
    echo        OR set JAVA_HOME manually:
    echo        set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.x.x
    echo        set PATH=%%JAVA_HOME%%\bin;%%PATH%%
    pause & exit /b 1
) else (
    echo [OK] Java found
)

REM ===== CHECK MYSQL =====
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] MySQL CLI not found on PATH.
    echo        Make sure MySQL 8+ is running on localhost:3306
    echo        Download from: https://dev.mysql.com/downloads/mysql/
) else (
    echo [OK] MySQL found
    echo Creating database...
    mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS college_cms;" 2>nul
    if %errorlevel% equ 0 (
        echo [OK] Database 'college_cms' ready
    ) else (
        echo [WARN] Could not auto-create DB. Please create it manually:
        echo        mysql -u root -p
        echo        CREATE DATABASE college_cms;
    )
)

echo.
echo ============================================================
echo   Starting Backend (Spring Boot)
echo ============================================================
echo.
echo NOTE: First run downloads Maven and dependencies (~2 min)
echo       Backend will start at http://localhost:8080
echo.

start "EduVault Backend" cmd /k "cd /d %~dp0backend && mvnw.cmd spring-boot:run"

echo Waiting 15 seconds for backend to initialize...
timeout /t 15 /nobreak >nul

echo.
echo ============================================================
echo   Installing Frontend Dependencies
echo ============================================================
echo.

cd /d %~dp0frontend
if not exist node_modules (
    echo Installing npm packages...
    "%NODE_PATH%\npm.cmd" install --ignore-scripts
)

echo.
echo ============================================================
echo   Starting Frontend (React)
echo ============================================================
echo.
echo Frontend will start at http://localhost:3000
echo.

start "EduVault Frontend" cmd /k "cd /d %~dp0frontend && set PATH=%NODE_PATH%;%PATH% && "%NODE_PATH%\npm.cmd" start"

echo.
echo ============================================================
echo   EduVault is starting up!
echo ============================================================
echo.
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8080
echo.
echo   Default Login Credentials:
echo   ---------------------------
echo   Admin:    admin    / admin123
echo   Faculty:  faculty1 / faculty123
echo   Student:  student1 / student123
echo.
echo ============================================================
pause
