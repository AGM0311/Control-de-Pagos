import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_API } from '../../utils/constantes';
import { Table } from 'react-bootstrap';

export function Registro() {
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);

  // Obtener clientes
  const fetchClientes = async () => {
    try {
      const res = await axios.get(`${BASE_API}/clientes`);
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      setClientes([]);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return (
    <div className="p-4">
      <h3 className="mb-3">Historial de Pagos</h3>

      {/* Selección de cliente */}
      <div className="mb-3">
        <label>Selecciona un cliente:</label>
        <select
          className="form-select"
          value={selectedCliente?.id || ""}
          onChange={e => {
            const cliente = clientes.find(c => c.id === e.target.value || c.id === Number(e.target.value));
            setSelectedCliente(cliente);
          }}
        >
          <option value="">-- Elegir cliente --</option>
          {clientes.map(cliente => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Mostrar pagos del cliente seleccionado */}
      {selectedCliente ? (
        <>
          <h5>Pagos de {selectedCliente.nombre}</h5>
          {(selectedCliente.pagos || []).length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Concepto</th>
                </tr>
              </thead>
              <tbody>
                {(selectedCliente.pagos || []).map((pago, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>${pago.monto}</td>
                    <td>{pago.fecha}</td>
                    <td>{pago.concepto || 'Pago'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No hay pagos registrados para este cliente.</p>
          )}
        </>
      ) : (
        <p>Selecciona un cliente para ver su historial de pagos.</p>
      )}
    </div>
  );
}