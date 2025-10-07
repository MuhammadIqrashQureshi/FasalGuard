@echo off
echo Starting FasalGuard Development Environment...
echo.

echo Installing backend dependencies...
cd backend
call npm install
echo.

echo Starting backend server...
start "Backend Server" cmd /k "npm run dev"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting frontend...
cd ..
call npm start

pause
