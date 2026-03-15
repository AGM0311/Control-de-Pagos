import React, { useState, useEffect } from "react";
import { Form, Button, Table, Row, Col } from "react-bootstrap";
import axios from "axios";
import { BASE_API } from "../../utils/constantes";

export function InformeForm({ refreshClientes }) {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [fecha, setFecha] = useState("");
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState("Efectivo");
  const [loading, setLoading] = useState(true);

  // Traer todos los clientes al montar el componente
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await axios.get(`${BASE_API}/clientes`);
        setClientes(res.data);
      } catch (err) {
        console.error(err);
        alert("Error al cargar los clientes");
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, []);

  // Función para agregar un pago
  const handleAgregarPago = async (e) => {
    e.preventDefault();
    if (!fecha || !monto || !clienteSeleccionado) return;

    const nuevoPago = {
      fecha,
      monto: parseFloat(monto),
      metodo: metodo || "N/A",
    };

    try {
      // Actualizamos localmente el cliente seleccionado
      const clienteActualizado = {
        ...clienteSeleccionado,
        pagos: [...(clienteSeleccionado.pagos || []), nuevoPago],
      };

      // Guardamos en el backend JSON
      await axios.put(`${BASE_API}/clientes/${clienteSeleccionado.id}`, clienteActualizado);

      // Limpiamos formulario
      setFecha("");
      setMonto("");
      setMetodo("Efectivo");

      // Actualizamos tabla inmediatamente
      setClienteSeleccionado(clienteActualizado);

      // Actualizamos lista de clientes si existe función en el padre
      refreshClientes?.();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "No se pudo registrar el pago");
    }
  };

  if (loading) return <p>Cargando clientes...</p>;

  return (
    <div className="p-3 border rounded shadow-sm mb-4">
      <h4>Registrar pago</h4>

      {/* Selector de clientes */}
      <Form.Select
        className="mb-3"
        value={clienteSeleccionado?.id || ""}
        onChange={(e) => {
          const c = clientes.find((cl) => cl.id === e.target.value);
          setClienteSeleccionado(c);
        }}
      >
        <option value="">Selecciona un cliente</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </Form.Select>

      {clienteSeleccionado && (
        <>
          {/* Formulario de pago */}
          <Form onSubmit={handleAgregarPago}>
            <Row className="mb-2">
              <Col md={3}>
                <Form.Control
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                />
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
                <Form.Control
                  type="text"
                  value={metodo}
                  placeholder="Método"
                  onChange={(e) => setMetodo(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Button type="submit" disabled={!fecha || !monto}>
                  Agregar Pago
                </Button>
              </Col>
            </Row>
          </Form>

          {/* Historial de pagos */}
          <h5 className="mt-3">Historial de Pagos - {clienteSeleccionado.nombre}</h5>
          {clienteSeleccionado.pagos?.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Método</th>
                </tr>
              </thead>
              <tbody>
                {clienteSeleccionado.pagos.map((p, i) => (
                  <tr key={i}>
                    <td>{p.fecha}</td>
                    <td>
                      {p.monto.toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      })}
                    </td>
                    <td>{p.metodo}</td>
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