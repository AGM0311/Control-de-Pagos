import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Form, Button, Table, Row, Col, Alert, Badge } from "react-bootstrap";
import { MdDelete, MdAttachMoney, MdArrowBack } from "react-icons/md";
import api from "../../api/api";
import { API_ROUTES, METODOS_PAGO } from "../../utils/constantes";
import {
  estadoPago,
  ordenarPagosDesc,
  formatearFecha,
  formatearMonto,
  hoyISO,
} from "../../utils/facturacion";

export function InformeForm() {
  const [searchParams] = useSearchParams();
  const clienteInicial = searchParams.get("cliente");

  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [fecha, setFecha] = useState(hoyISO());
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState(METODOS_PAGO[0]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState(null);

  const aplicarSeleccion = (c) => {
    if (!c) return;
    setClienteSeleccionado(c);
    setMonto(c.precio ? String(c.precio) : "");
    setFecha(hoyISO());
    setMetodo(METODOS_PAGO[0]);
    setMensaje(null);
  };

  const fetchClientes = async () => {
    try {
      const res = await api.get(API_ROUTES.CLIENTES.GET);
      const data = Array.isArray(res.data) ? res.data : [];
      setClientes(data);
      const objetivo = clienteSeleccionado?.id || clienteInicial;
      if (objetivo) {
        const c = data.find((x) => x.id === objetivo);
        if (c) aplicarSeleccion(c);
      }
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: "danger", texto: "No se pudieron cargar los clientes." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtro = busqueda.trim().toLowerCase();
  const clientesFiltrados = clientes
    .filter(
      (c) =>
        !filtro ||
        (c.nombre || "").toLowerCase().includes(filtro) ||
        (c.ip || "").toString().toLowerCase().includes(filtro) ||
        (c.telefono || "").toString().toLowerCase().includes(filtro)
    )
    .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es"));

  const registrarPago = async (cliente, datos) => {
    try {
      const res = await api.post(API_ROUTES.PAGOS.POST(cliente.id), datos);
      setMensaje({
        tipo: "success",
        texto: `Pago de ${cliente.nombre} registrado (${formatearMonto(datos.monto)}).`,
      });
      if (clienteSeleccionado?.id === cliente.id) setClienteSeleccionado(res.data);
      fetchClientes();
      return true;
    } catch (error) {
      console.error(error);
      setMensaje({
        tipo: "danger",
        texto: error.response?.data?.mensaje || "No se pudo registrar el pago.",
      });
      return false;
    }
  };

  // Cobro rápido: fecha de hoy + precio del cliente + método por defecto.
  const cobrarRapido = async (c) => {
    const precio = Number(c.precio) || 0;
    if (precio <= 0) {
      // Sin precio definido: abre el formulario para que capture el monto.
      aplicarSeleccion(c);
      return;
    }
    await registrarPago(c, { fecha: hoyISO(), monto: precio, metodo: METODOS_PAGO[0] });
  };

  const handleAgregarPago = async (e) => {
    e.preventDefault();
    if (!clienteSeleccionado || !fecha || !monto) return;
    const ok = await registrarPago(clienteSeleccionado, {
      fecha,
      monto: parseFloat(monto),
      metodo,
    });
    if (ok) {
      setFecha(hoyISO());
      setMetodo(METODOS_PAGO[0]);
    }
  };

  const handleEliminarPago = async (index) => {
    if (!window.confirm("¿Eliminar este pago?")) return;
    try {
      const pagosOriginales = clienteSeleccionado.pagos || [];
      const ordenados = ordenarPagosDesc(pagosOriginales);
      const indiceReal = pagosOriginales.indexOf(ordenados[index]);
      const res = await api.delete(API_ROUTES.PAGOS.DELETE(clienteSeleccionado.id, indiceReal));
      setClienteSeleccionado(res.data);
      fetchClientes();
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: "danger", texto: "No se pudo eliminar el pago." });
    }
  };

  if (loading) return <p className="p-4">Cargando clientes...</p>;

  const info = clienteSeleccionado ? estadoPago(clienteSeleccionado) : null;
  const pagosOrdenados = clienteSeleccionado ? ordenarPagosDesc(clienteSeleccionado.pagos) : [];
  const totalPagado = pagosOrdenados.reduce((acc, p) => acc + (Number(p.monto) || 0), 0);

  return (
    <div className="p-4">
      <h4>Registrar pago</h4>

      {mensaje && (
        <Alert variant={mensaje.tipo} onClose={() => setMensaje(null)} dismissible>
          {mensaje.texto}
        </Alert>
      )}

      <Form.Control
        type="text"
        className="mb-3"
        style={{ maxWidth: "420px" }}
        placeholder="Buscar cliente por nombre, IP o teléfono…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        autoFocus
      />

      {!clienteSeleccionado ? (
        <>
          {!filtro ? (
            <p className="text-muted">
              Escribe el nombre, IP o teléfono para encontrar al cliente, y usa{" "}
              <strong>Cobrar</strong> para registrar su pago de hoy en un clic.
            </p>
          ) : clientesFiltrados.length === 0 ? (
            <p className="text-muted">No se encontraron clientes con ese criterio.</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>IP</th>
                  <th>Plan</th>
                  <th>Precio</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((c) => (
                  <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => aplicarSeleccion(c)}>
                    <td>{c.nombre}</td>
                    <td>{c.ip || "—"}</td>
                    <td>{c.plan || "—"}</td>
                    <td>{formatearMonto(c.precio)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => cobrarRapido(c)}
                        disabled={Number(c.precio) <= 0}
                        title={Number(c.precio) <= 0 ? "Define el precio del cliente para cobrar en un clic" : "Registrar pago de hoy"}
                      >
                        <MdAttachMoney className="me-1" />
                        Cobrar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      ) : (
        <>
          <div className="d-flex align-items-center gap-2 mb-3">
            <Button variant="outline-secondary" size="sm" onClick={() => setClienteSeleccionado(null)}>
              <MdArrowBack className="me-1" />
              Elegir otro cliente
            </Button>
            <span className="fw-bold fs-5">{clienteSeleccionado.nombre}</span>
          </div>

          <div className="p-2 bg-light rounded mb-3 d-flex flex-wrap gap-3">
            <span>
              <strong>Plan:</strong> {clienteSeleccionado.plan || "—"}
            </span>
            <span>
              <strong>Precio:</strong> {formatearMonto(clienteSeleccionado.precio)}
            </span>
            <span>
              <strong>Último pago:</strong> {formatearFecha(info.ultimoPago)}
            </span>
            <span>
              <strong>Próximo pago:</strong> {formatearFecha(info.vencimiento)}
            </span>
            {info.vencido ? (
              <Badge bg="danger">Vencido hace {info.diasAtraso} días</Badge>
            ) : (
              <Badge bg="success">Al día · faltan {info.diffDias} días</Badge>
            )}
          </div>

          <Form onSubmit={handleAgregarPago}>
            <Row className="mb-2 align-items-end">
              <Col md={3}>
                <Form.Label>Fecha</Form.Label>
                <Form.Control type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
              </Col>
              <Col md={3}>
                <Form.Label>Monto</Form.Label>
                <Form.Control
                  type="number"
                  value={monto}
                  placeholder="Monto"
                  onChange={(e) => setMonto(e.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                />
              </Col>
              <Col md={3}>
                <Form.Label>Método</Form.Label>
                <Form.Select value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                  {METODOS_PAGO.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Button type="submit" disabled={!fecha || !monto} className="w-100">
                  <MdAttachMoney className="me-1" />
                  Agregar pago
                </Button>
              </Col>
            </Row>
          </Form>

          <h5 className="mt-4">
            Historial de pagos{" "}
            <span className="text-muted fs-6">(total: {formatearMonto(totalPagado)})</span>
          </h5>
          {pagosOrdenados.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Método</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pagosOrdenados.map((p, i) => (
                  <tr key={i}>
                    <td>{formatearFecha(p.fecha)}</td>
                    <td>{formatearMonto(p.monto)}</td>
                    <td>{p.metodo || "—"}</td>
                    <td>
                      <Button variant="outline-danger" size="sm" onClick={() => handleEliminarPago(i)}>
                        <MdDelete />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No hay pagos registrados.</p>
          )}
        </>
      )}
    </div>
  );
}
