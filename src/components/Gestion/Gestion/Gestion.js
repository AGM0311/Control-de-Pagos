import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_API } from '../../../utils/constantes';

export function Gestion() {
  // Inicializamos como array vacío
  const [alertas, setAlertas] = useState([]);

  // Función para obtener alertas
  const fetchAlertas = async () => {
    try {
      const res = await axios.get(`${BASE_API}/alertas`);
      // Aseguramos que siempre sea un array
      setAlertas(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al cargar alertas:", error);
      // Fallback: vaciar alertas si falla
      setAlertas([]);
    }
  };

  // Ejecutar al montar
  useEffect(() => {
    fetchAlertas();
  }, []);

  return (
    <div className="p-4">
      <h3 className="mb-3">Alertas</h3>

      <p>Total de alertas: {alertas?.length || 0}</p>

      {alertas && alertas.length > 0 ? (
        <ul>
          {alertas.map((alerta, index) => (
            <li key={index}>
              {alerta.mensaje || 'Sin mensaje'} {/* Ajusta según tu API */}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay alertas registradas.</p>
      )}
    </div>
  );
}