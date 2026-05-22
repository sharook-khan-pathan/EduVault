@echo off
set PATH=C:\Program Files\nodejs;%PATH%

echo Starting React frontend...
echo Frontend will be available at http://localhost:3000
echo.
cd /d %~dp0frontend
"C:\Program Files\nodejs\npm.cmd" start

pause
