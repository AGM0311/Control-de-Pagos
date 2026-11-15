import React, { useState } from "react";
import { Alert } from "react-bootstrap";
import api from "../api/api";
import { API_ROUTES } from "../utils/constantes";

export function ImportarClientes() {
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState(null);

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
      setMensaje({
        tipo: "success",
        texto: `Clientes importados: ${res.data.agregados}.`,
      });
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

  return (
    <div className="p-4">
      <h3>Importar clientes</h3>
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
          Subir archivo
        </button>
      </div>
    </div>
  );
}
