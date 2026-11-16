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
const BACKUPS_DIR = process.env.BACKUPS_DIR || path.join(path.dirname(DATA_DIR), "backups");
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(BACKUPS_DIR, { recursive: true });

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

// Fecha de hoy en formato "aaaa-mm-dd" (zona horaria local).
function fechaHoyISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
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
    if (!Number.isInteger(corte) || corte < 1 || corte > 31) {
      errores.push("'fechaCorte' debe ser un entero entre 1 y 31");
    }
  }
  if (body.estado !== undefined && !["activo", "suspendido"].includes(body.estado)) {
    errores.push("'estado' debe ser 'activo' o 'suspendido'");
  }
  if (body.fechaUltimoPago !== undefined && body.fechaUltimoPago !== "" && !esFechaValida(body.fechaUltimoPago)) {
    errores.push("'fechaUltimoPago' debe ser una fecha válida");
  }

  return errores;
}

// Recalcula "fechaUltimoPago" tomando la fecha más reciente entre el historial
// de pagos y el valor guardado (útil cuando se capturó un pago desde papel).
// Las fechas se guardan como "aaaa-mm-dd", así que se pueden ordenar como texto.
function recalcularUltimoPago(cliente) {
  const fechas = (cliente.pagos || [])
    .map((p) => p.fecha)
    .concat(cliente.fechaUltimoPago || [])
    .filter((f) => typeof f === "string" && /^\d{4}-\d{2}-\d{2}/.test(f))
    .sort();
  cliente.fechaUltimoPago = fechas.length ? fechas[fechas.length - 1] : "";
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
    fechaUltimoPago: body.fechaUltimoPago || "",
    fechaAlta: body.fechaAlta || fechaHoyISO(),
    roku: body.roku === true,
    rokuPagado: body.rokuPagado === true,
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

// Corrige el día de corte de varios clientes a la vez. Es útil después de
// importar, porque la importación crea a todos con corte el día 1.
//   { fechaCorte: 20 }                  -> aplica a TODOS los clientes.
//   { fechaCorte: 20, soloDiaActual: 1 } -> solo a los que hoy tienen corte 1.
app.post("/clientes-corte", (req, res) => {
  const { fechaCorte, soloDiaActual } = req.body || {};
  const corte = Number(fechaCorte);
  if (!Number.isInteger(corte) || corte < 1 || corte > 31) {
    return res.status(400).json({ mensaje: "'fechaCorte' debe ser un entero entre 1 y 31" });
  }

  const clientes = readData(FILE_CLIENTES);
  const filtro = soloDiaActual === undefined ? null : Number(soloDiaActual);
  let actualizados = 0;

  clientes.forEach((c) => {
    if (filtro !== null && Number(c.fechaCorte) !== filtro) return;
    if (Number(c.fechaCorte) !== corte) {
      c.fechaCorte = corte;
      actualizados++;
    }
  });

  if (actualizados > 0) writeData(FILE_CLIENTES, clientes);
  res.json({ actualizados });
});

// ---------------------------------------------------------------- pagos

app.post("/pago/:id", (req, res) => {
  const clientes = readData(FILE_CLIENTES);
  const cliente = clientes.find((c) => c.id === req.params.id);
  if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado" });

  const { fecha, monto, metodo, cobrador } = req.body || {};
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
    cobrador: (cobrador || "").toString().trim().slice(0, 60),
  };

  if (!Array.isArray(cliente.pagos)) cliente.pagos = [];
  cliente.pagos.push(nuevoPago);

  // Mantener "último pago" sincronizado con el historial.
  recalcularUltimoPago(cliente);

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

  // Recalcular el "último pago" a partir de los pagos que quedan.
  const fechas = cliente.pagos
    .map((p) => p.fecha)
    .filter((f) => typeof f === "string" && /^\d{4}-\d{2}-\d{2}/.test(f))
    .sort();
  cliente.fechaUltimoPago = fechas.length ? fechas[fechas.length - 1] : "";

  writeData(FILE_CLIENTES, clientes);
  res.json(cliente);
});

// Cobro masivo: registra el pago de varios clientes a la vez (fecha y método
// comunes; el monto es el precio mensual de cada cliente).
app.post("/pagos-lote", (req, res) => {
  const { clienteIds, fecha, metodo, cobrador } = req.body || {};
  if (!Array.isArray(clienteIds) || clienteIds.length === 0) {
    return res.status(400).json({ mensaje: "Debes indicar los clientes a cobrar" });
  }
  if (!esFechaValida(fecha)) {
    return res.status(400).json({ mensaje: "'fecha' es obligatoria y debe ser válida" });
  }

  const clientes = readData(FILE_CLIENTES);
  let cobrados = 0;
  let omitidos = 0;

  clienteIds.forEach((id) => {
    const cliente = clientes.find((c) => c.id === id);
    if (!cliente) {
      omitidos++;
      return;
    }
    const precio = Number(cliente.precio) || 0;
    if (precio <= 0) {
      omitidos++;
      return;
    }
    if (!Array.isArray(cliente.pagos)) cliente.pagos = [];
    cliente.pagos.push({
      fecha,
      monto: precio,
      metodo: metodo || "Efectivo",
      cobrador: (cobrador || "").toString().trim().slice(0, 60),
    });
    recalcularUltimoPago(cliente);
    cobrados++;
  });

  writeData(FILE_CLIENTES, clientes);
  res.json({ cobrados, omitidos });
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
      fechaAlta: fechaHoyISO(),
      roku: false,
      rokuPagado: false,
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

// ---------------------------------------------------------------- restauración

// Restaura clientes desde un respaldo JSON (un arreglo de clientes).
// No borra los existentes: añade los que no estén ya (por id o por IP).
app.post("/restaurar-clientes", (req, res) => {
  const respaldo = req.body;
  const lista = Array.isArray(respaldo)
    ? respaldo
    : Array.isArray(respaldo?.clientes)
      ? respaldo.clientes
      : null;

  if (!lista) {
    return res.status(400).json({ error: "El respaldo debe ser un arreglo de clientes" });
  }

  const clientesActuales = readData(FILE_CLIENTES);
  let agregados = 0;

  lista.forEach((c, i) => {
    if (!c || typeof c.nombre !== "string" || !c.nombre.trim()) return;

    const existe = clientesActuales.some(
      (existente) => existente.id === c.id || (c.ip && existente.ip === c.ip)
    );
    if (existe) return;

    clientesActuales.push({
      id: c.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${i}`,
      nombre: c.nombre.trim(),
      telefono: c.telefono || "",
      ip: c.ip || "",
      plan: c.plan || "",
      precio: Number(c.precio) || 0,
      fechaCorte: Number(c.fechaCorte) || 1,
      estado: c.estado === "suspendido" ? "suspendido" : "activo",
      fechaUltimoPago: c.fechaUltimoPago || "",
      fechaAlta: c.fechaAlta || fechaHoyISO(),
      roku: c.roku === true,
      rokuPagado: c.rokuPagado === true,
      pagos: Array.isArray(c.pagos) ? c.pagos : [],
    });
    agregados++;
  });

  writeData(FILE_CLIENTES, clientesActuales);
  res.json({ mensaje: "Respaldo restaurado", agregados });
});

// ---------------------------------------------------------------- respaldos

function listarBackups() {
  try {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    return fs
      .readdirSync(BACKUPS_DIR)
      .filter((f) => /^backup-[0-9-]+\.json$/.test(f))
      .map((f) => {
        const full = path.join(BACKUPS_DIR, f);
        const stat = fs.statSync(full);
        let contenido = null;
        try {
          contenido = JSON.parse(fs.readFileSync(full, "utf8"));
        } catch (_) {
          contenido = null;
        }
        return {
          id: f,
          fecha: contenido?.fecha || stat.mtime.toISOString(),
          tamano: stat.size,
          clientes: Array.isArray(contenido?.clientes) ? contenido.clientes.length : 0,
          alertas: Array.isArray(contenido?.alertas) ? contenido.alertas.length : 0,
        };
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  } catch (error) {
    console.error("Error listando respaldos:", error.message);
    return [];
  }
}

function crearBackup() {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  const f = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const nombre = `backup-${f.getFullYear()}-${pad(f.getMonth() + 1)}-${pad(f.getDate())}-${pad(f.getHours())}-${pad(f.getMinutes())}-${pad(f.getSeconds())}.json`;
  const backup = {
    fecha: f.toISOString(),
    clientes: readData(FILE_CLIENTES),
    alertas: readData(FILE_ALERTAS),
  };
  fs.writeFileSync(path.join(BACKUPS_DIR, nombre), JSON.stringify(backup, null, 2));

  // Conservar solo los últimos 30 respaldos.
  listarBackups()
    .slice(30)
    .forEach((b) => {
      try {
        fs.unlinkSync(path.join(BACKUPS_DIR, b.id));
      } catch (_) {}
    });

  return {
    id: nombre,
    fecha: f.toISOString(),
    clientes: backup.clientes.length,
    alertas: backup.alertas.length,
  };
}

function nombreBackupValido(id) {
  return /^backup-[0-9-]+\.json$/.test(id) && !id.includes("..");
}

app.get("/backups", (_req, res) => res.json(listarBackups()));

app.post("/backups", (_req, res) => res.json(crearBackup()));

app.delete("/backups/:id", (req, res) => {
  if (!nombreBackupValido(req.params.id)) return res.status(400).json({ error: "Nombre de respaldo inválido" });
  const ruta = path.join(BACKUPS_DIR, req.params.id);
  if (!fs.existsSync(ruta)) return res.status(404).json({ error: "Respaldo no encontrado" });
  fs.unlinkSync(ruta);
  res.json({ mensaje: "Respaldo eliminado" });
});

app.post("/backups/:id/restore", (req, res) => {
  if (!nombreBackupValido(req.params.id)) return res.status(400).json({ error: "Nombre de respaldo inválido" });
  const ruta = path.join(BACKUPS_DIR, req.params.id);
  if (!fs.existsSync(ruta)) return res.status(404).json({ error: "Respaldo no encontrado" });

  let backup;
  try {
    backup = JSON.parse(fs.readFileSync(ruta, "utf8"));
  } catch (_) {
    return res.status(500).json({ error: "Respaldo corrupto" });
  }

  // Antes de restaurar, guarda un respaldo del estado actual (por si acaso).
  crearBackup();

  if (Array.isArray(backup.clientes)) writeData(FILE_CLIENTES, backup.clientes);
  if (Array.isArray(backup.alertas)) writeData(FILE_ALERTAS, backup.alertas);

  res.json({
    mensaje: "Respaldo restaurado",
    clientes: Array.isArray(backup.clientes) ? backup.clientes.length : 0,
  });
});

// ---------------------------------------------------------------- servidor

// Inicia el servidor Express y, si existe el frontend compilado (`build/`),
// también lo sirve. Así la app de escritorio solo abre http://localhost:PORT
// y frontend y backend comparten el mismo origen (sin problemas de CORS).
function startServer(port = PORT) {
  // Asigna fecha de alta a clientes de versiones anteriores (una sola vez):
  // así un cliente sin pagos registrados no aparece vencido por cortes
  // anteriores a la fecha en que se empezó a usar la app.
  try {
    const clientes = readData(FILE_CLIENTES);
    let cambios = 0;
    clientes.forEach((c) => {
      if (!c.fechaAlta) {
        c.fechaAlta = fechaHoyISO();
        cambios++;
      }
    });
    if (cambios > 0) writeData(FILE_CLIENTES, clientes);
  } catch (error) {
    console.error("Error al asignar fechas de alta:", error.message);
  }

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

    // Respaldo automático al arrancar (solo si ya hay clientes cargados).
    try {
      const datos = readData(FILE_CLIENTES);
      if (datos.length > 0) crearBackup();
    } catch (error) {
      console.error("Error al crear respaldo automático:", error.message);
    }
  });
}

module.exports = { app, startServer, crearBackup };

// Solo arranca automáticamente si se ejecuta directo (node server.js).
if (require.main === module) {
  startServer();
}
