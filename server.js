// Backend de Control de Pagos
// Servidor Express que guarda clientes, pagos y alertas en archivos JSON.
// Sin base de datos externa: pensado para funcionar sin conexión y,
// a futuro, empaquetarse dentro de una aplicación de escritorio (Electron).

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const xlsx = require("xlsx");
const mammoth = require("mammoth");

const app = express();
const PORT = process.env.PORT || 3001;

// CORS: por defecto acepta cualquier origen local (dev + app de escritorio).
const clientOrigin = process.env.CLIENT_ORIGIN;
app.use(
  cors({
    origin: clientOrigin
      ? clientOrigin.split(",").map((o) => o.trim())
      : [/^https?:\/\/localhost(:\d+)?$/, /^https?:\/\/127\.0\.0\.1(:\d+)?$/],
  })
);
app.use(express.json());

// Los directorios de datos se pueden reubicar con variables de entorno.
// La app de escritorio los apunta a la carpeta de datos del usuario, porque el
// ejecutable empaquetado (.asar) es de solo lectura.
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, "uploads");
const BUILD_DIR = path.join(__dirname, "build");
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const upload = multer({ dest: UPLOADS_DIR });

const FILE_CLIENTES = path.join(DATA_DIR, "clientes.json");
const FILE_ALERTAS = path.join(DATA_DIR, "alertas.json");

// ---------------------------------------------------------------- almacenamiento

function readData(file) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, "[]");
      return [];
    }
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!Array.isArray(data)) {
      fs.writeFileSync(file, "[]");
      return [];
    }
    return data;
  } catch (error) {
    console.error(`Error leyendo ${file}:`, error.message);
    return [];
  }
}

// Escritura "atómica": escribe en un archivo temporal y luego lo renombra,
// para no corromper el JSON si el proceso se interrumpe a mitad de escritura.
function writeData(file, data) {
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

// ---------------------------------------------------------------- validación

function esFechaValida(valor) {
  if (typeof valor !== "string") return false;
  const d = new Date(valor);
  return !Number.isNaN(d.getTime());
}

function validarCliente(body, parcial = false) {
  const errores = [];

  if (!parcial || body.nombre !== undefined) {
    if (typeof body.nombre !== "string" || !body.nombre.trim()) {
      errores.push("'nombre' es obligatorio");
    }
  }
  if (body.precio !== undefined) {
    const precio = Number(body.precio);
    if (!Number.isFinite(precio) || precio < 0) {
      errores.push("'precio' debe ser un número mayor o igual a 0");
    }
  }
  if (body.fechaCorte !== undefined) {
    const corte = Number(body.fechaCorte);
    if (!Number.isInteger(corte) || corte < 1 || corte > 28) {
      errores.push("'fechaCorte' debe ser un entero entre 1 y 28");
    }
  }
  if (body.estado !== undefined && !["activo", "suspendido"].includes(body.estado)) {
    errores.push("'estado' debe ser 'activo' o 'suspendido'");
  }

  return errores;
}

function clienteNormalizado(body) {
  return {
    nombre: (body.nombre || "").trim(),
    telefono: body.telefono || "",
    ip: body.ip || "",
    plan: body.plan || "",
    precio: Number(body.precio) || 0,
    fechaCorte: Number(body.fechaCorte) || 1,
    estado: body.estado || "activo",
    pagos: [],
  };
}

// ---------------------------------------------------------------- clientes

app.get("/clientes", (_req, res) => {
  res.json(readData(FILE_CLIENTES));
});

app.get("/clientes/:id", (req, res) => {
  const cliente = readData(FILE_CLIENTES).find((c) => c.id === req.params.id);
  if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado" });
  res.json(cliente);
});

app.post("/clientes", (req, res) => {
  const errores = validarCliente(req.body || {});
  if (errores.length) return res.status(400).json({ errores });

  const clientes = readData(FILE_CLIENTES);
  const nuevoCliente = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...clienteNormalizado(req.body),
  };
  clientes.push(nuevoCliente);
  writeData(FILE_CLIENTES, clientes);
  res.status(201).json(nuevoCliente);
});

app.put("/clientes/:id", (req, res) => {
  const clientes = readData(FILE_CLIENTES);
  const index = clientes.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ mensaje: "Cliente no encontrado" });

  const errores = validarCliente(req.body || {}, true);
  if (errores.length) return res.status(400).json({ errores });

  // No permitir sobreescribir campos sensibles desde un PUT general.
  const campos = { ...req.body };
  delete campos.id;
  delete campos.pagos;
  clientes[index] = { ...clientes[index], ...campos };
  writeData(FILE_CLIENTES, clientes);
  res.json(clientes[index]);
});

app.delete("/clientes/:id", (req, res) => {
  const originales = readData(FILE_CLIENTES);
  const clientes = originales.filter((c) => c.id !== req.params.id);
  if (clientes.length === originales.length) {
    return res.status(404).json({ mensaje: "Cliente no encontrado" });
  }
  writeData(FILE_CLIENTES, clientes);
  res.json({ mensaje: "Cliente eliminado" });
});

// ---------------------------------------------------------------- pagos

app.post("/pago/:id", (req, res) => {
  const clientes = readData(FILE_CLIENTES);
  const cliente = clientes.find((c) => c.id === req.params.id);
  if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado" });

  const { fecha, monto, metodo } = req.body || {};
  const montoNum = Number(monto);

  if (!esFechaValida(fecha)) {
    return res.status(400).json({ mensaje: "'fecha' es obligatoria y debe ser válida" });
  }
  if (!Number.isFinite(montoNum) || montoNum <= 0) {
    return res.status(400).json({ mensaje: "'monto' debe ser un número mayor que 0" });
  }

  const nuevoPago = {
    fecha,
    monto: montoNum,
    metodo: metodo || "Efectivo",
  };

  if (!Array.isArray(cliente.pagos)) cliente.pagos = [];
  cliente.pagos.push(nuevoPago);
  writeData(FILE_CLIENTES, clientes);
  res.status(201).json(cliente);
});

app.delete("/pago/:id/:index", (req, res) => {
  const clientes = readData(FILE_CLIENTES);
  const cliente = clientes.find((c) => c.id === req.params.id);
  if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado" });

  const index = Number(req.params.index);
  if (!Array.isArray(cliente.pagos) || !cliente.pagos[index]) {
    return res.status(404).json({ mensaje: "Pago no encontrado" });
  }

  cliente.pagos.splice(index, 1);
  writeData(FILE_CLIENTES, clientes);
  res.json(cliente);
});

// ---------------------------------------------------------------- alertas

app.get("/alertas", (_req, res) => {
  res.json(readData(FILE_ALERTAS));
});

app.post("/alertas", (req, res) => {
  const alertas = readData(FILE_ALERTAS);
  const nuevaAlerta = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...req.body };
  alertas.push(nuevaAlerta);
  writeData(FILE_ALERTAS, alertas);
  res.status(201).json(nuevaAlerta);
});

app.delete("/alertas/:id", (req, res) => {
  const originales = readData(FILE_ALERTAS);
  const alertas = originales.filter((a) => a.id !== req.params.id);
  writeData(FILE_ALERTAS, alertas);
  res.json({ mensaje: "Alerta eliminada" });
});

// ---------------------------------------------------------------- importación

// Importa clientes desde Word (.docx) o Excel (.xlsx): solo IP y NOMBRE.
app.post("/importar-clientes", upload.single("archivo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No se recibió ningún archivo" });

    const filePath = req.file.path;
    const nombreArchivo = (req.file.originalname || "").toLowerCase();
    const clientesActuales = readData(FILE_CLIENTES);
    let nuevosClientes = [];

    const plantilla = (ip, nombre) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ip: (ip || "").toString().trim(),
      nombre: (nombre || "").toString().trim(),
      telefono: "",
      plan: "fibra",
      precio: 0,
      fechaCorte: 1,
      estado: "activo",
      pagos: [],
    });

    if (nombreArchivo.endsWith(".xlsx") || nombreArchivo.endsWith(".xls")) {
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);
      nuevosClientes = data.map((c) => plantilla(c.IP ?? c.ip, c.Nombre ?? c.nombre));
    } else if (nombreArchivo.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ path: filePath });
      const lineas = result.value.split("\n").filter((l) => l.trim());
      nuevosClientes = lineas.map((linea) => {
        const columnas = linea.split(/\t| {2,}/).map((c) => c.trim());
        return plantilla(columnas[0], columnas[1]);
      });
    } else {
      return res.status(400).json({ error: "Formato no soportado (usa .docx o .xlsx)" });
    }

    // Evitar duplicados por IP (solo cuando la IP no viene vacía).
    const filtrados = nuevosClientes.filter(
      (nuevo) =>
        nuevo.nombre &&
        nuevo.ip &&
        !clientesActuales.some((c) => c.ip === nuevo.ip)
    );

    writeData(FILE_CLIENTES, [...clientesActuales, ...filtrados]);

    // Limpiar el archivo temporal subido.
    fs.unlink(filePath, () => {});

    res.json({ mensaje: "Clientes importados", agregados: filtrados.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error importando clientes" });
  }
});

// ---------------------------------------------------------------- servidor

// Inicia el servidor Express y, si existe el frontend compilado (`build/`),
// también lo sirve. Así la app de escritorio solo abre http://localhost:PORT
// y frontend y backend comparten el mismo origen (sin problemas de CORS).
function startServer(port = PORT) {
  if (fs.existsSync(BUILD_DIR)) {
    app.use(express.static(BUILD_DIR));
    app.get("*", (req, res) => {
      // Las rutas de la API desconocidas devuelven 404 JSON, no la SPA.
      if (/^\/(clientes|alertas|pago|importar-clientes)/.test(req.path)) {
        return res.status(404).json({ mensaje: "No encontrado" });
      }
      res.sendFile(path.join(BUILD_DIR, "index.html"));
    });
  }

  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
}

module.exports = { app, startServer };

// Solo arranca automáticamente si se ejecuta directo (node server.js).
if (require.main === module) {
  startServer();
}
