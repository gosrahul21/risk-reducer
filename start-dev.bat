@echo off
echo Starting Full Stack Development Environment...
echo.
echo Backend will run on: http://localhost:3000
echo Frontend will run on: http://localhost:3001
echo.
echo Starting both servers...
start "Backend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "cd frontend && npm start"
echo.
echo Both servers are starting...
echo Press any key to close this window
pause > nul
