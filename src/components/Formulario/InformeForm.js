import React, { useState, useEffect } from "react";
import { Form, Button, Table, Row, Col, Alert } from "react-bootstrap";
import { MdDelete } from "react-icons/md";
import api from "../../api/api";
import { API_ROUTES, METODOS_PAGO } from "../../utils/constantes";
import { formatearFecha, formatearMonto } from "../../utils/facturacion";

export function InformeForm() {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [fecha, setFecha] = useState("");
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState(METODOS_PAGO[0]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState(null);

  const fetchClientes = async () => {
    try {
      const res = await api.get(API_ROUTES.CLIENTES.GET);
      const data = Array.isArray(res.data) ? res.data : [];
      setClientes(data);
      if (clienteSeleccionado) {
        const actualizado = data.find((c) => c.id === clienteSeleccionado.id);
        setClienteSeleccionado(actualizado || null);
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
      setFecha("");
      setMonto("");
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
      const res = await api.delete(API_ROUTES.PAGOS.DELETE(clienteSeleccionado.id, index));
      setClienteSeleccionado(res.data);
      fetchClientes();
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: "danger", texto: "No se pudo eliminar el pago." });
    }
  };

  if (loading) return <p className="p-3">Cargando clientes...</p>;

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
        onChange={(e) => {
          const c = clientes.find((cl) => cl.id === e.target.value);
          setClienteSeleccionado(c || null);
        }}
      >
        <option value="">Selecciona un cliente</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre} {c.ip ? `· IP ${c.ip}` : ""}
          </option>
        ))}
      </Form.Select>

      {clienteSeleccionado && (
        <>
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

          <h5 className="mt-3">Historial de pagos — {clienteSeleccionado.nombre}</h5>
          {clienteSeleccionado.pagos?.length > 0 ? (
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
                {clienteSeleccionado.pagos.map((p, i) => (
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
