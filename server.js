require('dotenv').config();
const express = require('express');
const { ObjectId } = require('mongodb');
const cors = require('cors');
const { BASE_API, API_ROUTES } = require('./src/utils/constantes');
const { connectToDatabase, getDb } = require('./src/db/connection');

const app = express();
const port = 3001;

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json());

// Conexión a MongoDB antes de iniciar el servidor
connectToDatabase().then(() => {
  // Rutas para trabajadores
  app.get(API_ROUTES.TRABAJADORES.GET, async (req, res) => {
    try {
      const db = getDb();
      const trabajadores = await db.collection('trabajadores').find().toArray();
      res.json(trabajadores);
    } catch (err) {
      res.status(500).json({ message: 'Error al leer los datos', error: err.message });
    }
  });

  app.post(API_ROUTES.TRABAJADORES.POST, async (req, res) => {
    try {
      const newTrabajador = req.body;
      const db = getDb();
      const result = await db.collection('trabajadores').insertOne(newTrabajador);
      
      res.status(201).json({
        ...newTrabajador,
        _id: result.insertedId
      });
    } catch (err) {
      res.status(500).json({ message: 'Error al guardar los datos', error: err.message });
    }
  });

  app.delete(`${API_ROUTES.TRABAJADORES.DELETE}/:id`, async (req, res) => {
    try {
      const trabajadorId = req.params.id;
      const db = getDb();
      const result = await db.collection('trabajadores').deleteOne({ _id: new ObjectId(trabajadorId) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Trabajador no encontrado' });
      }
      
      res.status(200).json({ message: 'Trabajador eliminado' });
    } catch (err) {
      res.status(500).json({ message: 'Error al eliminar el trabajador', error: err.message });
    }
  });

  // Rutas para ganado
  app.get(API_ROUTES.GANADO.GET, async (req, res) => {
    try {
      const db = getDb();
      const ganado = await db.collection('ganado').find().toArray();
      res.json(ganado);
    } catch (err) {
      res.status(500).json({ message: 'Error al leer los datos', error: err.message });
    }
  });

  app.post(API_ROUTES.GANADO.POST, async (req, res) => {
    try {
      const newGanado = req.body;
      const db = getDb();
      const result = await db.collection('ganado').insertOne(newGanado);
      
      res.status(201).json({
        ...newGanado,
        _id: result.insertedId
      });
    } catch (err) {
      res.status(500).json({ message: 'Error al guardar los datos', error: err.message });
    }
  });

  app.delete(`${API_ROUTES.GANADO.DELETE}/:id`, async (req, res) => {
    try {
      const ganadoId = req.params.id;
      const db = getDb();
      const result = await db.collection('ganado').deleteOne({ _id: new ObjectId(ganadoId) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Ganado no encontrado' });
      }
      
      res.status(200).json({ message: 'Ganado eliminado' });
    } catch (err) {
      res.status(500).json({ message: 'Error al eliminar el ganado', error: err.message });
    }
  });

  // Rutas para eventos
  app.get(API_ROUTES.EVENTOS.GET, async (req, res) => {
    try {
      const db = getDb();
      const eventos = await db.collection('eventos').find().toArray();
      res.json(eventos);
    } catch (err) {
      res.status(500).json({ message: 'Error al leer los datos', error: err.message });
    }
  });

  app.post(API_ROUTES.EVENTOS.POST, async (req, res) => {
    try {
      const newEvento = req.body;
      const db = getDb();
      const result = await db.collection('eventos').insertOne(newEvento);
      
      res.status(201).json({
        ...newEvento,
        _id: result.insertedId
      });
    } catch (err) {
      res.status(500).json({ message: 'Error al guardar los datos', error: err.message });
    }
  });

  app.delete(`${API_ROUTES.EVENTOS.DELETE}/:id`, async (req, res) => {
    try {
      const eventoId = req.params.id;
      const db = getDb();
      const result = await db.collection('eventos').deleteOne({ _id: new ObjectId(eventoId) });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Evento no encontrado' });
      }
      
      res.status(200).json({ message: 'Evento eliminado' });
    } catch (err) {
      res.status(500).json({ message: 'Error al eliminar el evento', error: err.message });
    }
  });

  // Iniciar el servidor
  app.listen(port, () => {
    console.log(`Servidor escuchando en ${BASE_API}:${port}`);
  });
}).catch(err => {
  console.error('No se pudo iniciar la aplicación:', err);
});