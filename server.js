require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const { connectToDatabase, getDb } = require('./src/db/connection');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  try {
    getDb();
    next();
  } catch (err) {
    res.status(500).json({ message: 'Error con la base de datos', error: err.message });
  }
});

const isValidId = id => ObjectId.isValid(id);





















// GANADO ________________________________________________________________________________________________________________
app.get('/api/ganado', async (req, res) => {
  try {
    const db = getDb();
    const datos = await db.collection('ganado').find().toArray();
    res.json(datos);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener ganado', error: err.message });
  }
});

app.post('/api/ganado', async (req, res) => {
  const datos = req.body;
  if (!datos.nombre || !datos.arete) return res.status(400).json({ message: 'Faltan datos requeridos' });

  try {
    const db = getDb();
    const result = await db.collection('ganado').insertOne(datos);
    res.status(201).json({ ...datos, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: 'Error al guardar ganado', error: err.message });
  }
});

app.delete('/api/ganado/:id', async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: 'ID no válido' });

  try {
    const db = getDb();
    const result = await db.collection('ganado').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Ganado no encontrado' });
    res.json({ message: 'Ganado eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar ganado', error: err.message });
  }
});

app.put('/api/ganado/:id', async (req, res) => {
  const { id } = req.params;
  const actualizados = req.body;

  if (!isValidId(id)) return res.status(400).json({ message: 'ID no válido' });
  if (!actualizados.nombre || !actualizados.arete) return res.status(400).json({ message: 'Faltan datos requeridos' });

  if (actualizados.peso) actualizados.peso = parseFloat(actualizados.peso);

  try {
    const db = getDb();
    const result = await db.collection('ganado').updateOne(
      { _id: new ObjectId(id) },
      { $set: actualizados }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Ganado no encontrado' });
    res.json({ message: 'Ganado actualizado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar ganado', error: err.message });
  }
});










// TRABAJADORES ________________________________________________________________________________________________________________
app.get('/api/trabajadores', async (req, res) => {
  try {
    const db = getDb();
    const datos = await db.collection('trabajadores').find().toArray();
    res.json(datos);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener trabajadores', error: err.message });
  }
});

app.post('/api/trabajadores', async (req, res) => {
  const datos = req.body;
  if (!datos.nombre || !datos.puesto) 
    return res.status(400).json({ message: 'Faltan datos requeridos: nombre y puesto' });

  try {
    const db = getDb();
    const result = await db.collection('trabajadores').insertOne(datos);
    res.status(201).json({ ...datos, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: 'Error al guardar trabajador', error: err.message });
  }
});

app.delete('/api/trabajadores/:id', async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: 'ID no válido' });

  try {
    const db = getDb();
    const result = await db.collection('trabajadores').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Trabajador no encontrado' });
    res.json({ message: 'Trabajador eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar trabajador', error: err.message });
  }
});

app.put('/api/trabajadores/:id', async (req, res) => {
  const { id } = req.params;
  const actualizados = req.body;

  if (!isValidId(id)) return res.status(400).json({ message: 'ID no válido' });
  if (!actualizados.nombre || !actualizados.puesto) 
    return res.status(400).json({ message: 'Faltan datos requeridos: nombre y puesto' });

  try {
    const db = getDb();
    const result = await db.collection('trabajadores').updateOne(
      { _id: new ObjectId(id) },
      { $set: actualizados }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Trabajador no encontrado' });
    res.json({ message: 'Trabajador actualizado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar trabajador', error: err.message });
  }
});















// 404 para rutas no encontradas
app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));


// Conexión y arranque
connectToDatabase()
  .then(() => {
    console.log('Conexión a MongoDB establecida');
    app.listen(port, () => {
      console.log(`Servidor activo en puerto ${port}`);
    });
  })
  .catch(err => {
    console.error('No se pudo iniciar la aplicación:', err);
    process.exit(1);
  });
