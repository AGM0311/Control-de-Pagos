import React, { useEffect, useState } from "react";
import { Table, Alert } from "react-bootstrap";
import { MdDelete } from "react-icons/md";
import { Button } from "react-bootstrap";
import api from "../../api/api";
import { API_ROUTES } from "../../utils/constantes";
import { formatearFecha, formatearMonto } from "../../utils/facturacion";

export function Registro() {
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const fetchClientes = async () => {
    try {
      const res = await api.get(API_ROUTES.CLIENTES.GET);
      const data = Array.isArray(res.data) ? res.data : [];
      setClientes(data);
      if (selectedCliente) {
        const actualizado = data.find((c) => c.id === selectedCliente.id);
        setSelectedCliente(actualizado || null);
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      setClientes([]);
    }
  };

  useEffect(() => {
    fetchClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPagado = (selectedCliente?.pagos || []).reduce((acc, p) => acc + (Number(p.monto) || 0), 0);

  const handleEliminarPago = async (index) => {
    if (!window.confirm("¿Eliminar este pago?")) return;
    try {
      const res = await api.delete(API_ROUTES.PAGOS.DELETE(selectedCliente.id, index));
      setSelectedCliente(res.data);
      fetchClientes();
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: "danger", texto: "No se pudo eliminar el pago." });
    }
  };

  return (
    <div className="p-4">
      <h3 className="mb-3">Historial de Pagos</h3>

      {mensaje && (
        <Alert variant={mensaje.tipo} onClose={() => setMensaje(null)} dismissible>
          {mensaje.texto}
        </Alert>
      )}

      <div className="mb-3">
        <label className="form-label">Selecciona un cliente:</label>
        <select
          className="form-select"
          value={selectedCliente?.id || ""}
          onChange={(e) => {
            const cliente = clientes.find((c) => c.id === e.target.value);
            setSelectedCliente(cliente || null);
          }}
        >
          <option value="">-- Elegir cliente --</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre} {cliente.ip ? `· IP ${cliente.ip}` : ""}
            </option>
          ))}
        </select>
      </div>

      {selectedCliente ? (
        <>
          <h5>
            Pagos de {selectedCliente.nombre}{" "}
            <span className="text-muted">(total: {formatearMonto(totalPagado)})</span>
          </h5>
          {(selectedCliente.pagos || []).length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Método</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(selectedCliente.pagos || []).map((pago, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{formatearMonto(pago.monto)}</td>
                    <td>{formatearFecha(pago.fecha)}</td>
                    <td>{pago.metodo || "—"}</td>
                    <td>
                      <Button variant="outline-danger" size="sm" onClick={() => handleEliminarPago(index)}>
                        <MdDelete />
                      </Button>
                    </td>
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
