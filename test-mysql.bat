@echo off
"C:\PROGRA~1\MySQL\MYSQLS~1.0\bin\mysql.exe" -u root -proot -e "SELECT 'Connected!' AS status;"
echo Exit code: %errorlevel%
pause
