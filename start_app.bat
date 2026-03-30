@echo off
echo Starting YSPM Timetable App...

:: Start Node Backend
start "Node Backend" cmd /k "cd /d %~dp0server && npm run dev"

:: Start React Frontend
start "React Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo Servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo You can minimize these windows, but DO NOT CLOSE THEM while using the app.
pause
