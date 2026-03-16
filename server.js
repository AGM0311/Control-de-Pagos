const express = require("express");
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const xlsx = require("xlsx");
const mammoth = require("mammoth");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const FILE_CLIENTES = "./data/clientes.json";
const FILE_ALERTAS = "./data/alertas.json";

function readData(file) {
  try {
    if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
    const data = JSON.parse(fs.readFileSync(file));
    if (!Array.isArray(data)) {
      fs.writeFileSync(file, "[]");
      return [];
    }
    return data;
  } catch (error) {
    fs.writeFileSync(file, "[]");
    return [];
  }
}

function writeData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// CRUD CLIENTES
app.get("/clientes", (req, res) => res.json(readData(FILE_CLIENTES)));

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
  const index = clientes.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ mensaje: "Cliente no encontrado" });
  clientes[index] = { ...clientes[index], ...req.body };
  writeData(FILE_CLIENTES, clientes);
  res.json(clientes[index]);
});

app.delete("/clientes/:id", (req, res) => {
  const clientes = readData(FILE_CLIENTES).filter(c => c.id !== req.params.id);
  writeData(FILE_CLIENTES, clientes);
  res.json({ mensaje: "Cliente eliminado" });
});

// PAGOS
app.post("/pago/:id", (req, res) => {
  const clientes = readData(FILE_CLIENTES);
  const cliente = clientes.find(c => c.id === req.params.id);
  if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado" });

  const nuevoPago = {
    fecha: req.body.fecha,
    monto: req.body.monto,
    metodo: req.body.metodo || "N/A"
  };
  if (!Array.isArray(cliente.pagos)) cliente.pagos = [];
  cliente.pagos.push(nuevoPago);

  writeData(FILE_CLIENTES, clientes);
  res.json(cliente);
});

// ALERTAS
app.get("/alertas", (req, res) => res.json(readData(FILE_ALERTAS)));
app.post("/alertas", (req, res) => {
  const alertas = readData(FILE_ALERTAS);
  const nuevaAlerta = { id: Date.now().toString(), ...req.body };
  alertas.push(nuevaAlerta);
  writeData(FILE_ALERTAS, alertas);
  res.json(nuevaAlerta);
});

// IMPORTAR CLIENTES (WORD / EXCEL) - solo IP y NOMBRE
app.post("/importar-clientes", upload.single("archivo"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const clientesActuales = readData(FILE_CLIENTES);
    let nuevosClientes = [];

    // Excel
    if (req.file.originalname.endsWith(".xlsx")) {
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);
      nuevosClientes = data.map((c, i) => ({
        id: Date.now() + i + "",
        ip: c.IP || c.ip || "",
        nombre: c.Nombre || c.nombre || "",
        telefono: "N/A",
        plan: "antena",
        precio: 400,
        fechaCorte: 1,
        estado: "activo",
        pagos: []
      }));
    }

    // Word
    if (req.file.originalname.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ path: filePath });
      const lineas = result.value.split("\n").filter(l => l.trim());

      nuevosClientes = lineas.map((linea, i) => {
        // separar columnas por tabulaciones o 2+ espacios
        const columnas = linea.split(/\t| {2,}/).map(c => c.trim());
        const ip = columnas[0] || "";
        const nombre = columnas[1] || "";
        return {
          id: Date.now() + i + "",
          ip,
          nombre,
          telefono: "N/A",
          plan: "antena",
          precio: 400,
          fechaCorte: 1,
          estado: "activo",
          pagos: []
        };
      });
    }

    // Evitar duplicados por IP
    const filtrados = nuevosClientes.filter(
      nuevo => !clientesActuales.some(c => c.ip === nuevo.ip && nuevo.ip !== "")
    );
    const resultado = [...clientesActuales, ...filtrados];
    writeData(FILE_CLIENTES, resultado);

    res.json({ mensaje: "Clientes importados", agregados: filtrados.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error importando clientes" });
  }
});

// SERVIDOR
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});