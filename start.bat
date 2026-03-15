@echo off
echo Iniciando backend y frontend...

REM --- Ir a la carpeta donde está este start.bat ---
cd /d %~dp0

REM --- Verificar que server.js existe ---
if exist server.js (
    echo Levantando backend con server.js...
    start cmd /k "node server.js"
) else (
    echo ERROR: no se encontro server.js en %cd%
    pause
    exit /b
)

REM --- Esperar 4 segundos para que el backend inicie ---
timeout /t 4 >nul

REM --- Verificar que existe la carpeta src para React ---
if exist src (
    echo Levantando React...
    start cmd /k "npm start"
) else (
    echo ERROR: no se encontro carpeta src para React
    pause
    exit /b
)

echo Backend y frontend iniciados.
pause