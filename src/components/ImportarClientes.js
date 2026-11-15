import React, { useState, useEffect } from "react";
import { Alert, Card, Button, Table } from "react-bootstrap";
import { MdDownload, MdUpload, MdRestore, MdBackup, MdDelete } from "react-icons/md";
import api from "../api/api";
import { API_ROUTES } from "../utils/constantes";
import { hoyISO, formatearFecha } from "../utils/facturacion";

export function ImportarClientes() {
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [archivoRespaldo, setArchivoRespaldo] = useState(null);
  const [mensajeRespaldo, setMensajeRespaldo] = useState(null);
  const [mensajeDescarga, setMensajeDescarga] = useState(null);

  // Respaldos automáticos
  const [backups, setBackups] = useState([]);
  const [mensajeBackups, setMensajeBackups] = useState(null);

  const fetchBackups = async () => {
    try {
      const res = await api.get(API_ROUTES.BACKUPS.GET);
      setBackups(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al obtener respaldos:", error);
      setBackups([]);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const hacerBackupAhora = async () => {
    setMensajeBackups(null);
    try {
      await api.post(API_ROUTES.BACKUPS.POST);
      setMensajeBackups({ tipo: "success", texto: "Respaldo creado correctamente." });
      fetchBackups();
    } catch (error) {
      console.error(error);
      setMensajeBackups({ tipo: "danger", texto: "No se pudo crear el respaldo." });
    }
  };

  const restaurarBackup = async (b) => {
    if (
      !window.confirm(
        `¿Restaurar el respaldo de ${formatearFecha(b.fecha)}? Se reemplazarán los datos actuales.`
      )
    ) {
      return;
    }
    try {
      await api.post(API_ROUTES.BACKUPS.RESTORE(b.id));
      setMensajeBackups({ tipo: "success", texto: "Respaldo restaurado correctamente." });
      fetchBackups();
    } catch (error) {
      console.error(error);
      setMensajeBackups({ tipo: "danger", texto: "No se pudo restaurar el respaldo." });
    }
  };

  const eliminarBackup = async (b) => {
    if (!window.confirm("¿Eliminar este respaldo?")) return;
    try {
      await api.delete(API_ROUTES.BACKUPS.DELETE(b.id));
      fetchBackups();
    } catch (error) {
      console.error(error);
      setMensajeBackups({ tipo: "danger", texto: "No se pudo eliminar el respaldo." });
    }
  };

  // ---- Importar desde Word/Excel ----
  const subirArchivo = async () => {
    setMensaje(null);
    if (!archivo) {
      setMensaje({ tipo: "warning", texto: "Selecciona un archivo primero." });
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivo);

    try {
      const res = await api.post(API_ROUTES.IMPORTAR, formData);
      setMensaje({ tipo: "success", texto: `Clientes importados: ${res.data.agregados}.` });
      setArchivo(null);
      document.getElementById("archivoImport").value = "";
    } catch (error) {
      console.error(error);
      setMensaje({
        tipo: "danger",
        texto: error.response?.data?.error || "Error al importar el archivo.",
      });
    }
  };

  // ---- Descargar respaldo JSON ----
  const descargarRespaldo = async () => {
    setMensajeDescarga(null);
    try {
      const res = await api.get(API_ROUTES.CLIENTES.GET);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `respaldo-clientes-${hoyISO()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMensajeDescarga({ tipo: "success", texto: "Respaldo descargado correctamente." });
    } catch (error) {
      console.error(error);
      setMensajeDescarga({ tipo: "danger", texto: "No se pudo generar el respaldo." });
    }
  };

  // ---- Restaurar respaldo JSON ----
  const restaurarRespaldo = async () => {
    setMensajeRespaldo(null);
    if (!archivoRespaldo) {
      setMensajeRespaldo({ tipo: "warning", texto: "Selecciona un archivo .json primero." });
      return;
    }

    try {
      const texto = await archivoRespaldo.text();
      const datos = JSON.parse(texto);
      const res = await api.post(API_ROUTES.RESTAURAR, datos);
      setMensajeRespaldo({
        tipo: "success",
        texto: `Respaldo restaurado: ${res.data.agregados} clientes añadidos (se omitieron los que ya existían).`,
      });
      setArchivoRespaldo(null);
      document.getElementById("archivoRespaldo").value = "";
    } catch (error) {
      console.error(error);
      setMensajeRespaldo({
        tipo: "danger",
        texto: error.response?.data?.error || "El archivo no es un respaldo JSON válido.",
      });
    }
  };

  return (
    <div className="p-4">
      <h3>Respaldos e importación</h3>

      {/* Respaldos automáticos */}
      <Card className="p-3 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Respaldos automáticos</h5>
          <Button variant="primary" onClick={hacerBackupAhora}>
            <MdBackup className="me-1" />
            Hacer respaldo ahora
          </Button>
        </div>
        <p className="text-muted">
          La app guarda un respaldo automático cada vez que se abre (conserva los últimos 30).
          Aquí puedes crear uno manual, restaurar uno anterior o eliminarlo.
        </p>

        {mensajeBackups && (
          <Alert variant={mensajeBackups.tipo} onClose={() => setMensajeBackups(null)} dismissible>
            {mensajeBackups.texto}
          </Alert>
        )}

        {backups.length === 0 ? (
          <p className="text-muted">Todavía no hay respaldos.</p>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Clientes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.id}>
                  <td>{formatearFecha(b.fecha)}</td>
                  <td>{b.clientes}</td>
                  <td>
                    <Button variant="outline-success" size="sm" className="me-2" onClick={() => restaurarBackup(b)}>
                      <MdRestore className="me-1" />
                      Restaurar
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => eliminarBackup(b)}>
                      <MdDelete />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Descargar respaldo */}
      <Card className="p-3 mb-4">
        <h5>Descargar respaldo (.json)</h5>
        <p className="text-muted">
          Guarda una copia de <strong>todos los clientes</strong> (con sus pagos) en un archivo,
          para pasarla a otra computadora o guardarla fuera de la app.
        </p>

        {mensajeDescarga && (
          <Alert variant={mensajeDescarga.tipo} onClose={() => setMensajeDescarga(null)} dismissible>
            {mensajeDescarga.texto}
          </Alert>
        )}

        <Button variant="primary" onClick={descargarRespaldo}>
          <MdDownload className="me-1" />
          Descargar respaldo
        </Button>
      </Card>

      {/* Restaurar respaldo JSON */}
      <Card className="p-3 mb-4">
        <h5>Restaurar respaldo (.json)</h5>
        <p className="text-muted">
          Carga un respaldo de clientes (archivo <strong>.json</strong>). No borra lo que ya
          tienes: añade los clientes que falten.
        </p>

        {mensajeRespaldo && (
          <Alert variant={mensajeRespaldo.tipo} onClose={() => setMensajeRespaldo(null)} dismissible>
            {mensajeRespaldo.texto}
          </Alert>
        )}

        <div className="d-flex align-items-center gap-2">
          <input
            id="archivoRespaldo"
            className="form-control"
            style={{ maxWidth: "360px" }}
            type="file"
            accept=".json"
            onChange={(e) => setArchivoRespaldo(e.target.files[0])}
          />
          <Button variant="success" onClick={restaurarRespaldo}>
            <MdRestore className="me-1" />
            Restaurar respaldo
          </Button>
        </div>
      </Card>

      {/* Importar Word/Excel */}
      <Card className="p-3">
        <h5>Importar desde Word o Excel</h5>
        <p className="text-muted">
          Sube un archivo <strong>.docx</strong> o <strong>.xlsx</strong> con las columnas{" "}
          <em>IP</em> y <em>Nombre</em>. Se importarán solo los clientes cuya IP no exista ya.
        </p>

        {mensaje && (
          <Alert variant={mensaje.tipo} onClose={() => setMensaje(null)} dismissible>
            {mensaje.texto}
          </Alert>
        )}

        <div className="d-flex align-items-center gap-2">
          <input
            id="archivoImport"
            className="form-control"
            style={{ maxWidth: "360px" }}
            type="file"
            accept=".docx, .xlsx"
            onChange={(e) => setArchivo(e.target.files[0])}
          />
          <Button variant="secondary" onClick={subirArchivo}>
            <MdUpload className="me-1" />
            Importar
          </Button>
        </div>
      </Card>
    </div>
  );
}
