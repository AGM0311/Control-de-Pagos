import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import api from "../../../api/api";
import { API_ROUTES } from "../../../utils/constantes";
import { estadoPago, formatearFecha, formatearMonto } from "../../../utils/facturacion";

export function Gestion() {
  const [clientes, setClientes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatos = async () => {
      setLoading(true);
      try {
        const [resClientes, resAlertas] = await Promise.all([
          api.get(API_ROUTES.CLIENTES.GET),
          api.get(API_ROUTES.ALERTAS.GET),
        ]);
        setClientes(Array.isArray(resClientes.data) ? resClientes.data : []);
        setAlertas(Array.isArray(resAlertas.data) ? resAlertas.data : []);
      } catch (err) {
        console.error("Error al cargar clientes o alertas:", err);
        setClientes([]);
        setAlertas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDatos();
  }, []);

  if (loading) return <p className="p-4">Cargando clientes y alertas...</p>;

  const conEstado = clientes
    .map((c) => ({ ...c, estado: estadoPago(c) }))
    .filter((c) => c.estado.vencido || c.estado.diffDias <= 7)
    .sort((a, b) => a.estado.diffDias - b.estado.diffDias);

  const vencidos = conEstado.filter((c) => c.estado.vencido);
  const porVencer = conEstado.filter((c) => !c.estado.vencido);

  const alertasDe = (clienteId) => alertas.filter((a) => a.clienteId === clienteId);

  const renderFila = (cliente) => {
    const alertasCliente = alertasDe(cliente.id);
    return (
      <tr
        key={cliente.id}
        style={{ backgroundColor: cliente.estado.vencido ? "#f8d7da" : cliente.estado.diffDias <= 3 ? "#fff3cd" : "transparent" }}
      >
        <td>{cliente.nombre}</td>
        <td>{cliente.plan || "—"}</td>
        <td>{formatearMonto(cliente.precio)}</td>
        <td>{formatearFecha(cliente.estado.vencimiento)}</td>
        <td>{cliente.estado.vencido ? `Vencido hace ${cliente.estado.diasAtraso} días` : `En ${cliente.estado.diffDias} días`}</td>
        <td>
          {alertasCliente.length > 0 ? (
            <ul className="mb-0">
              {alertasCliente.map((a) => (
                <li key={a.id}>{a.mensaje}</li>
              ))}
            </ul>
          ) : (
            <span className="text-muted">Sin alertas</span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="p-4">
      <h3 className="mb-3">Pagos próximos y vencidos</h3>

      {vencidos.length === 0 && porVencer.length === 0 ? (
        <p>No hay pagos próximos a vencer.</p>
      ) : (
        <>
          {vencidos.length > 0 && (
            <>
              <h5 className="text-danger">Vencidos ({vencidos.length})</h5>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Plan</th>
                    <th>Precio</th>
                    <th>Corte</th>
                    <th>Atraso</th>
                    <th>Alertas</th>
                  </tr>
                </thead>
                <tbody>{vencidos.map(renderFila)}</tbody>
              </Table>
            </>
          )}

          {porVencer.length > 0 && (
            <>
              <h5 className="mt-4">Por vencer en los próximos 7 días ({porVencer.length})</h5>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Plan</th>
                    <th>Precio</th>
                    <th>Próximo pago</th>
                    <th>Días</th>
                    <th>Alertas</th>
                  </tr>
                </thead>
                <tbody>{porVencer.map(renderFila)}</tbody>
              </Table>
            </>
          )}
        </>
      )}
    </div>
  );
}
