@echo off
TITLE ShopEase - Local Development Launcher
echo ===================================================
echo   ShopEase Full-Stack E-Commerce Platform
echo ===================================================
echo.
echo Starting Backend API on http://localhost:5000 ...
start "ShopEase Backend (Port 5000)" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend SPA on http://localhost:3000 ...
start "ShopEase Frontend (Port 3000)" cmd /k "cd frontend && npm run dev"

timeout /t 2 /nobreak > nul

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo ===================================================
echo   Both services launched in separate windows!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo ===================================================
pause

