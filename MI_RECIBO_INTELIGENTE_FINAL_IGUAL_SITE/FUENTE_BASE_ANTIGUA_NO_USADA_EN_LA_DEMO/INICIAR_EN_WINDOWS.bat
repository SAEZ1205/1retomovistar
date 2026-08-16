@echo off
title Mi Movistar - Reto 1
cd /d "%~dp0"
echo Instalando dependencias...
call npm install
if errorlevel 1 pause & exit /b 1
echo.
echo Iniciando React + Vite en http://localhost:3000
call npm run dev
pause
