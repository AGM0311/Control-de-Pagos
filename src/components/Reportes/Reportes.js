import React, { useEffect, useState } from "react";
import { Card, Row, Col, Table, Button, Alert } from "react-bootstrap";
import { MdDownload } from "react-icons/md";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import api from "../../api/api";
import { API_ROUTES } from "../../utils/constantes";
import {
  estadoPago,
  ingresosDelMes,
  ingresosTotales,
  ingresosPorMes,
  clientesPorPlan,
  formatearMonto,
  hoyISO,
} from "../../utils/facturacion";

export function Reportes() {
  const [clientes, setClientes] = useState([]);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const res = await api.get(API_ROUTES.CLIENTES.GET);
        setClientes(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setClientes([]);
      }
    };
    fetchDatos();
  }, []);

  const activos = clientes.filter((c) => c.estado === "activo").length;
  const suspendidos = clientes.length - activos;
  const vencidos = clientes.filter((c) => estadoPago(c).vencido).length;
  const ingresosMes = ingresosDelMes(clientes);
  const totalHistorico = ingresosTotales(clientes);
  const porMes = ingresosPorMes(clientes, 12);
  const porPlan = clientesPorPlan(clientes);

  const exportarCSV = () => {
    const columnas = [
      "Nombre",
      "Teléfono",
      "IP",
      "Plan",
      "Precio",
      "Día de corte",
      "Estado",
      "Último pago",
    ];
    const filas = [columnas];
    clientes.forEach((c) => {
      filas.push([
        c.nombre || "",
        c.telefono || "",
        c.ip || "",
        c.plan || "",
        c.precio || 0,
        c.fechaCorte || "",
        c.estado || "",
        c.fechaUltimoPago || "",
      ]);
    });
    const csv = filas
      .map((f) => f.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clientes-${hoyISO()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMensaje({ tipo: "success", texto: "Clientes exportados a CSV." });
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Reportes</h3>
        <Button variant="primary" onClick={exportarCSV}>
          <MdDownload className="me-1" />
          Exportar clientes (CSV)
        </Button>
      </div>

      {mensaje && (
        <Alert variant={mensaje.tipo} onClose={() => setMensaje(null)} dismissible>
          {mensaje.texto}
        </Alert>
      )}

      {/* Tarjetas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card bg="primary" text="white" className="text-center">
            <Card.Body>
              <Card.Title>Total clientes</Card.Title>
              <h3>{clientes.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card bg="success" text="white" className="text-center">
            <Card.Body>
              <Card.Title>Activos</Card.Title>
              <h3>{activos}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card bg="danger" text="white" className="text-center">
            <Card.Body>
              <Card.Title>Vencidos</Card.Title>
              <h3>{vencidos}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card bg="warning" className="text-center">
            <Card.Body>
              <Card.Title>Ingresos del mes</Card.Title>
              <h3>{formatearMonto(ingresosMes)}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Body>
              <Card.Title>
                Ingresos por mes{" "}
                <span className="text-muted fs-6">
                  (total histórico: {formatearMonto(totalHistorico)})
                </span>
              </Card.Title>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={porMes} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="etiqueta" />
                  <YAxis tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(value) => formatearMonto(value)} />
                  <Bar dataKey="total" fill="#0d6efd" name="Ingresos" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Clientes por plan</Card.Title>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Clientes</th>
                    <th>Ingreso mensual</th>
                  </tr>
                </thead>
                <tbody>
                  {porPlan.map((p) => (
                    <tr key={p.plan}>
                      <td>{p.plan}</td>
                      <td>{p.cantidad}</td>
                      <td>{formatearMonto(p.ingresosMensuales)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Resumen</Card.Title>
              <Table striped bordered>
                <tbody>
                  <tr>
                    <td>Activos</td>
                    <td>{activos}</td>
                  </tr>
                  <tr>
                    <td>Suspendidos</td>
                    <td>{suspendidos}</td>
                  </tr>
                  <tr>
                    <td>Vencidos</td>
                    <td>{vencidos}</td>
                  </tr>
                  <tr>
                    <td>Ingresos del mes</td>
                    <td>{formatearMonto(ingresosMes)}</td>
                  </tr>
                  <tr>
                    <td>Total cobrado histórico</td>
                    <td>{formatearMonto(totalHistorico)}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
