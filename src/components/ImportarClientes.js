import React, { useState } from "react";
import { Alert, Card } from "react-bootstrap";
import api from "../api/api";
import { API_ROUTES } from "../utils/constantes";

export function ImportarClientes() {
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [archivoRespaldo, setArchivoRespaldo] = useState(null);
  const [mensajeRespaldo, setMensajeRespaldo] = useState(null);

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
      <h3>Importar y restaurar clientes</h3>

      {/* Importar Word/Excel */}
      <Card className="p-3 mb-4">
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
          <button className="btn btn-primary" onClick={subirArchivo}>
            Importar
          </button>
        </div>
      </Card>

      {/* Restaurar respaldo JSON */}
      <Card className="p-3">
        <h5>Restaurar respaldo (.json)</h5>
        <p className="text-muted">
          Carga un respaldo completo de clientes (archivo <strong>clientes.json</strong>).
          No borra lo que ya tienes: añade los clientes que falten.
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
          <button className="btn btn-success" onClick={restaurarRespaldo}>
            Restaurar respaldo
          </button>
        </div>
      </Card>
    </div>
  );
}
