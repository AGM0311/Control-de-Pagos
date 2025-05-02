const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db('BovOsData'); // Cambiado a tu nombre de base de datos
    console.log("✅ Conectado a MongoDB Atlas (BovOsData)");
    return db;
  } catch (err) {
    console.error("❌ Error al conectar a MongoDB Atlas", err);
    process.exit(1);
  }
}

function getDb() {
  if (!db) throw new Error("No se ha establecido conexión con la base de datos");
  return db;
}

module.exports = {
  connectToDatabase,
  getDb
};