@echo off
echo ======================================================================
echo           BioSync — Biometric Attendance & Management System
echo ======================================================================
echo.
echo Starting FastAPI Backend Server on http://127.0.0.1:8000 ...
start "BioSync Backend API" cmd /k "cd backend && uvicorn app.main:app --reload --port 8000"

timeout /t 3 >nul

echo Starting Vite React Web Dashboard on http://localhost:3000 ...
start "BioSync React Web App" cmd /k "cd frontend && npm run dev"

echo.
echo ======================================================================
echo Backend Docs:  http://127.0.0.1:8000/docs
echo Web Dashboard: http://localhost:3000
echo Default Login: admin@system.com / admin123
echo ======================================================================
echo.
pause
