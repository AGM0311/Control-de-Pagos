const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ======================
// ARCHIVOS DE DATOS
// ======================
const FILE_CLIENTES = "./data/clientes.json";
const FILE_ALERTAS = "./data/alertas.json";

// ======================
// FUNCIONES AUXILIARES
// ======================
function readData(file) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, "[]");
      return [];
    }

    const data = JSON.parse(fs.readFileSync(file));

    // Validación: si no es array, lo reiniciamos
    if (!Array.isArray(data)) {
      fs.writeFileSync(file, "[]");
      return [];
    }

    return data;
  } catch (error) {
    // Si JSON corrupto, reiniciamos
    fs.writeFileSync(file, "[]");
    return [];
  }
}

function writeData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// =========================
// RUTAS CLIENTES
// =========================
app.get("/clientes", (req, res) => {
  const clientes = readData(FILE_CLIENTES);
  res.json(clientes);
});

app.post("/clientes", (req, res) => {
  const clientes = readData(FILE_CLIENTES);

  const nuevoCliente = {
    id: Date.now().toString(),
    nombre: req.body.nombre || "",
    telefono: req.body.telefono || "",
    ip: req.body.ip || "",
    plan: req.body.plan || "",
    precio: req.body.precio || 0,
    fechaCorte: req.body.fechaCorte || 1,
    estado: req.body.estado || "activo",
    pagos: []
  };

  clientes.push(nuevoCliente);
  writeData(FILE_CLIENTES, clientes);

  res.json(nuevoCliente);
});

app.put("/clientes/:id", (req, res) => {
  const clientes = readData(FILE_CLIENTES);
  const { id } = req.params;

  const index = clientes.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ mensaje: "Cliente no encontrado" });

  clientes[index] = { ...clientes[index], ...req.body };
  writeData(FILE_CLIENTES, clientes);

  res.json(clientes[index]);
});

app.delete("/clientes/:id", (req, res) => {
  const clientes = readData(FILE_CLIENTES);
  const nuevosClientes = clientes.filter(c => c.id !== req.params.id);
  writeData(FILE_CLIENTES, nuevosClientes);
  res.json({ mensaje: "Cliente eliminado" });
});

// =========================
// RUTA PAGOS
// =========================
app.post("/pago/:id", (req, res) => {
  const clientes = readData(FILE_CLIENTES);
  const { id } = req.params;

  const cliente = clientes.find(c => c.id === id);
  if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado" });

  const nuevoPago = {
    fecha: req.body.fecha,
    monto: req.body.monto
  };

  // Asegurarnos que pagos sea un array
  if (!Array.isArray(cliente.pagos)) cliente.pagos = [];

  cliente.pagos.push(nuevoPago);
  writeData(FILE_CLIENTES, clientes);

  res.json(cliente);
});

// =========================
// RUTAS ALERTAS
// =========================
app.get("/alertas", (req, res) => {
  const alertas = readData(FILE_ALERTAS);
  res.json(alertas);
});

app.post("/alertas", (req, res) => {
  const alertas = readData(FILE_ALERTAS);
  const nuevaAlerta = { id: Date.now().toString(), ...req.body };
  alertas.push(nuevaAlerta);
  writeData(FILE_ALERTAS, alertas);
  res.json(nuevaAlerta);
});

// =========================
// SERVIDOR
// =========================
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});