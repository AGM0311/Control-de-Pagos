import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Form } from "react-bootstrap";
import { MdAttachMoney } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import api from "../../../api/api";
import { API_ROUTES } from "../../../utils/constantes";
import { estadoPago, formatearFecha, formatearMonto, porCobrar, whatsappLink, mensajeWhatsapp } from "../../../utils/facturacion";

export function Gestion() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
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

  const filtro = busqueda.trim().toLowerCase();

  const conEstado = clientes
    .map((c) => ({ ...c, estado: estadoPago(c) }))
    .filter((c) => {
      const coincide =
        !filtro ||
        (c.nombre || "").toLowerCase().includes(filtro) ||
        (c.ip || "").toString().toLowerCase().includes(filtro) ||
        (c.telefono || "").toString().toLowerCase().includes(filtro);
      // Con búsqueda: solo coincidencias. Sin búsqueda: vencidos + próximos 7 días.
      if (filtro) return coincide;
      return c.estado.vencido || c.estado.diffDias <= 7;
    })
    .sort((a, b) => a.estado.diffDias - b.estado.diffDias);

  const vencidos = conEstado.filter((c) => c.estado.vencido);
  const porVencer = conEstado.filter((c) => !c.estado.vencido);
  const totalPorCobrar = porCobrar(clientes);

  const alertasDe = (clienteId) => alertas.filter((a) => a.clienteId === clienteId);

  const cobrar = (id) => navigate(`/informe?cliente=${id}`);

  const renderFila = (cliente) => {
    const alertasCliente = alertasDe(cliente.id);
    return (
      <tr
        key={cliente.id}
        style={{
          backgroundColor: cliente.estado.vencido
            ? "#f8d7da"
            : cliente.estado.diffDias <= 3
              ? "#fff3cd"
              : "transparent",
        }}
      >
        <td>{cliente.nombre}</td>
        <td>{cliente.plan || "—"}</td>
        <td>{formatearMonto(cliente.precio)}</td>
        <td>{formatearFecha(cliente.estado.vencimiento)}</td>
        <td>
          {cliente.estado.vencido
            ? `Vencido hace ${cliente.estado.diasAtraso} días`
            : `En ${cliente.estado.diffDias} días`}
        </td>
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
        <td>
          {whatsappLink(cliente.telefono) && (
            <Button
              variant="outline-success"
              size="sm"
              className="me-2"
              onClick={() => window.open(whatsappLink(cliente.telefono, mensajeWhatsapp(cliente)), "_blank")}
              title="Enviar WhatsApp"
            >
              <FaWhatsapp />
            </Button>
          )}
          <Button variant="success" size="sm" onClick={() => cobrar(cliente.id)}>
            <MdAttachMoney className="me-1" />
            Cobrar
          </Button>
        </td>
      </tr>
    );
  };

  return (
    <div className="p-4">
      <h3 className="mb-3">Pagos próximos y vencidos</h3>

      {vencidos.length > 0 && (
        <div className="alert alert-danger py-2">
          Tienes <strong>{vencidos.length}</strong> clientes vencidos · Por cobrar:{" "}
          <strong>{formatearMonto(totalPorCobrar)}</strong>
        </div>
      )}

      <Form.Control
        type="text"
        className="mb-3"
        style={{ maxWidth: "360px" }}
        placeholder="Buscar por nombre, IP o teléfono…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {conEstado.length === 0 ? (
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
                    <th></th>
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
                    <th></th>
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
