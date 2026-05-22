@echo off
set JAVA_HOME=C:\PROGRA~1\ECLIPS~1\JDK-17~1.10-
set MVN=%USERPROFILE%\Downloads\apache-maven-3.9.16-bin\apache-maven-3.9.16\bin\mvn.cmd
set PATH=%JAVA_HOME%\bin;%PATH%

echo =============================================
echo  EduVault Backend - Spring Boot
echo =============================================
echo.
echo Java:
"%JAVA_HOME%\bin\java.exe" -version
echo.
echo Maven:
call "%MVN%" -version
echo.
echo Starting backend at http://localhost:8080
echo Press Ctrl+C to stop
echo.
call "%MVN%" spring-boot:run
pause
