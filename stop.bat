@echo off
echo ================================
echo Cerrando backend y frontend...
echo ================================

REM --- Detener todos los procesos Node ---
taskkill /IM node.exe /F >nul 2>&1

REM --- Mensaje final ---
echo Todos los procesos Node detenidos.
echo Ahora puedes cerrar esta ventana.
pause