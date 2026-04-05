@echo off
REM ========================================
REM SIVILIZE-HUB PRO - Development Starter
REM ========================================
cls
echo.
echo ╔════════════════════════════════════════════════════╗
echo ║   SIVILIZE-HUB PRO - Development Environment       ║
echo ║   Starting Backend and Frontend Servers            ║
echo ╚════════════════════════════════════════════════════╝
echo.

echo [1/2] Starting Backend Server on port 5000...
echo.
start "Backend - SIVILIZE-HUB PRO" cmd /k "cd server && npm run dev"

echo [2/2] Waiting 3 seconds before starting Frontend...
timeout /t 3 /nobreak

echo.
echo Starting Frontend Server on port 5173...
echo.
start "Frontend - SIVILIZE-HUB PRO" cmd /k "npm run dev"

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║   ✅ Development Environment Started!              ║
echo ║                                                    ║
echo ║   Backend:  http://localhost:5000                  ║
echo ║   Frontend: http://localhost:5173                  ║
echo ║                                                    ║
echo ║   Open your browser and go to:                    ║
echo ║   👉 http://localhost:5173                         ║
echo ║                                                    ║
echo ║   Close any terminal to stop the server            ║
echo ╚════════════════════════════════════════════════════╝
echo.
pause
