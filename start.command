#!/bin/bash
# Inicia el backend (Express) y el frontend (React) en macOS/Linux.
# La primera vez, ejecuta: chmod +x start.command

cd "$(dirname "$0")"

echo "Instalando dependencias si hace falta..."
if [ ! -d node_modules ]; then
  npm install || { echo "Error instalando dependencias"; exit 1; }
fi

echo "Levantando el backend (http://localhost:3001)..."
node server.js &
BACKEND_PID=$!

sleep 1

echo "Levantando el frontend (http://localhost:3000)..."
npm start

# Al cerrar el frontend, detener también el backend.
kill $BACKEND_PID 2>/dev/null
