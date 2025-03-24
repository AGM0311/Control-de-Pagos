const express = require('express');
const fs = require('fs');
const path = require('path');
const { BASE_API, API_ROUTES } = require('../../utils/constantes');

const app = express();
const port = 3001;

app.use(express.json()); // Para analizar el cuerpo de las solicitudes en formato JSON

// Rutas para trabajadores
const trabajadoresPath = path.join(__dirname, 'data', 'trabajadores.json');

app.get(API_ROUTES.TRABAJADORES.GET, (req, res) => {
  fs.readFile(trabajadoresPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error al leer los datos' });
    res.json(JSON.parse(data));
  });
});

app.post(API_ROUTES.TRABAJADORES.POST, (req, res) => {
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

app.delete(API_ROUTES.TRABAJADORES.DELETE, (req, res) => {
  const trabajadorId = parseInt(req.params.id);
  fs.readFile(trabajadoresPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error al leer los datos' });
    let trabajadores = JSON.parse(data);
    trabajadores = trabajadores.filter(t => t.id !== trabajadorId);
    fs.writeFile(trabajadoresPath, JSON.stringify(trabajadores, null, 2), (err) => {
      if (err) return res.status(500).json({ message: 'Error al guardar los datos' });
      res.status(200).json({ message: 'Trabajador eliminado' });
    });
  });
});

// Rutas para ganado
const ganadoPath = path.join(__dirname, 'data', 'ganado.json');

app.get(API_ROUTES.GANADO.GET, (req, res) => {
  fs.readFile(ganadoPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error al leer los datos' });
    res.json(JSON.parse(data));
  });
});

app.post(API_ROUTES.GANADO.POST, (req, res) => {
  const newGanado = req.body;
  fs.readFile(ganadoPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error al leer los datos' });
    const ganado = JSON.parse(data);
    newGanado.id = ganado.length + 1;
    ganado.push(newGanado);
    fs.writeFile(ganadoPath, JSON.stringify(ganado, null, 2), (err) => {
      if (err) return res.status(500).json({ message: 'Error al guardar los datos' });
      res.status(201).json(newGanado);
    });
  });
});

app.delete(API_ROUTES.GANADO.DELETE, (req, res) => {
  const ganadoId = parseInt(req.params.id);
  fs.readFile(ganadoPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error al leer los datos' });
    let ganado = JSON.parse(data);
    ganado = ganado.filter(g => g.id !== ganadoId);
    fs.writeFile(ganadoPath, JSON.stringify(ganado, null, 2), (err) => {
      if (err) return res.status(500).json({ message: 'Error al guardar los datos' });
      res.status(200).json({ message: 'Ganado eliminado' });
    });
  });
});

// Rutas para eventos
const eventosPath = path.join(__dirname, 'data', 'eventos.json');

app.get(API_ROUTES.EVENTOS.GET, (req, res) => {
  fs.readFile(eventosPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error al leer los datos' });
    res.json(JSON.parse(data));
  });
});

app.post(API_ROUTES.EVENTOS.POST, (req, res) => {
  const newEvento = req.body;
  fs.readFile(eventosPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error al leer los datos' });
    const eventos = JSON.parse(data);
    newEvento.id = eventos.length + 1;
    eventos.push(newEvento);
    fs.writeFile(eventosPath, JSON.stringify(eventos, null, 2), (err) => {
      if (err) return res.status(500).json({ message: 'Error al guardar los datos' });
      res.status(201).json(newEvento);
    });
  });
});

app.delete(API_ROUTES.EVENTOS.DELETE, (req, res) => {
  const eventoId = parseInt(req.params.id);
  fs.readFile(eventosPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error al leer los datos' });
    let eventos = JSON.parse(data);
    eventos = eventos.filter(e => e.id !== eventoId);
    fs.writeFile(eventosPath, JSON.stringify(eventos, null, 2), (err) => {
      if (err) return res.status(500).json({ message: 'Error al guardar los datos' });
      res.status(200).json({ message: 'Evento eliminado' });
    });
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en ${BASE_API}`);
});