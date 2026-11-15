import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Form, Button, Table, Row, Col, Alert, Badge } from "react-bootstrap";
import { MdDelete } from "react-icons/md";
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
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [fecha, setFecha] = useState(hoyISO());
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState(METODOS_PAGO[0]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState(null);

  const fetchClientes = async () => {
    try {
      const res = await api.get(API_ROUTES.CLIENTES.GET);
      const data = Array.isArray(res.data) ? res.data : [];
      setClientes(data);
      setClienteSeleccionado((prev) => {
        const objetivo = prev?.id || clienteInicial;
        return data.find((c) => c.id === objetivo) || (clienteInicial ? null : prev);
      });
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

  const seleccionarCliente = (id) => {
    const c = clientes.find((cl) => cl.id === id);
    setClienteSeleccionado(c || null);
    if (c) setMonto(c.precio ? String(c.precio) : "");
    setMensaje(null);
  };

  const handleAgregarPago = async (e) => {
    e.preventDefault();
    setMensaje(null);
    if (!clienteSeleccionado || !fecha || !monto) return;

    try {
      const res = await api.post(API_ROUTES.PAGOS.POST(clienteSeleccionado.id), {
        fecha,
        monto: parseFloat(monto),
        metodo,
      });
      setClienteSeleccionado(res.data);
      setFecha(hoyISO());
      setMetodo(METODOS_PAGO[0]);
      setMensaje({ tipo: "success", texto: "Pago registrado correctamente." });
      fetchClientes();
    } catch (error) {
      console.error(error);
      setMensaje({
        tipo: "danger",
        texto: error.response?.data?.mensaje || "No se pudo registrar el pago.",
      });
    }
  };

  const handleEliminarPago = async (index) => {
    if (!window.confirm("¿Eliminar este pago?")) return;
    try {
      // Los pagos se muestran ordenados por fecha desc, así que borramos sobre
      // el arreglo original usando el índice real.
      const pagosOriginales = clienteSeleccionado.pagos || [];
      const ordenados = ordenarPagosDesc(pagosOriginales);
      const pagoAEliminar = ordenados[index];
      const indiceReal = pagosOriginales.indexOf(pagoAEliminar);
      const res = await api.delete(API_ROUTES.PAGOS.DELETE(clienteSeleccionado.id, indiceReal));
      setClienteSeleccionado(res.data);
      fetchClientes();
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: "danger", texto: "No se pudo eliminar el pago." });
    }
  };

  if (loading) return <p className="p-3">Cargando clientes...</p>;

  const info = clienteSeleccionado ? estadoPago(clienteSeleccionado) : null;
  const pagosOrdenados = clienteSeleccionado ? ordenarPagosDesc(clienteSeleccionado.pagos) : [];
  const totalPagado = pagosOrdenados.reduce((acc, p) => acc + (Number(p.monto) || 0), 0);

  return (
    <div className="p-3 border rounded shadow-sm mb-4">
      <h4>Registrar pago</h4>

      {mensaje && (
        <Alert variant={mensaje.tipo} onClose={() => setMensaje(null)} dismissible>
          {mensaje.texto}
        </Alert>
      )}

      <Form.Select
        className="mb-3"
        value={clienteSeleccionado?.id || ""}
        onChange={(e) => seleccionarCliente(e.target.value)}
      >
        <option value="">Selecciona un cliente</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre} {c.ip ? `· IP ${c.ip}` : ""}
          </option>
        ))}
      </Form.Select>

      {clienteSeleccionado && info && (
        <>
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
            <Row className="mb-2">
              <Col md={3}>
                <Form.Control type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
              </Col>
              <Col md={3}>
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
                <Form.Select value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                  {METODOS_PAGO.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Button type="submit" disabled={!fecha || !monto}>
                  Agregar pago
                </Button>
              </Col>
            </Row>
          </Form>

          <h5 className="mt-3">
            Historial de pagos — {clienteSeleccionado.nombre}{" "}
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
