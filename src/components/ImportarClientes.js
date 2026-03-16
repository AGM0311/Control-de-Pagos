import React, { useState } from "react";
import axios from "axios";

export function ImportarClientes() {
  const [archivo, setArchivo] = useState(null);

  const subirArchivo = async () => {
    if (!archivo) return alert("Selecciona un archivo primero");

    const formData = new FormData();
    formData.append("archivo", archivo); // importante que el nombre sea 'archivo'

    try {
      const res = await axios.post(
        "http://localhost:3001/importar-clientes",
        formData
      );
      alert(`Clientes importados: ${res.data.agregados}`);
    } catch (error) {
      console.error(error);
      alert("Error al importar el archivo");
    }
  };

  return (
    <div style={{ padding: "1rem", border: "1px solid #ccc", margin: "1rem" }}>
      <h3>Importar clientes</h3>
      <input
        type="file"
        accept=".docx, .xlsx"
        onChange={(e) => setArchivo(e.target.files[0])}
      />
      <button onClick={subirArchivo} style={{ marginLeft: "1rem" }}>
        Subir archivo
      </button>
    </div>
  );
}