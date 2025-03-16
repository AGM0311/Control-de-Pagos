const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.use(express.json()); // Para analizar el cuerpo de las solicitudes en formato JSON

// Rutas para trabajadores
const trabajadoresPath = path.join(__dirname, 'data', 'trabajadores.json');

app.get('/api/trabajadores', (req, res) => {
  fs.readFile(trabajadoresPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error al leer los datos' });
    res.json(JSON.parse(data));
  });
});

app.post('/api/trabajadores', (req, res) => {
  const newTrabajador = req.body;
  fs.readFile(trabajadoresPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error al leer los datos' });
    const trabajadores = JSON.parse(data);
    newTrabajador.id = trabajadores.length + 1;
    trabajadores.push(newTrabajador);
    fs.writeFile(trabajadoresPath, JSON.stringify(trabajadores, null, 2), (err) => {
      if (err) return res.status(500).json({ message: 'Error al guardar los datos' });
      res.status(201).json(newTrabajador);
    });
  });
});

// Rutas para eventos y ganado (similares a las de trabajadores)

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});