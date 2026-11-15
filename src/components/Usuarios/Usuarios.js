import React, { useEffect, useState } from "react";
import { Table, Alert, Form, Button } from "react-bootstrap";
import { MdDelete, MdReceipt } from "react-icons/md";
import api from "../../api/api";
import { API_ROUTES } from "../../utils/constantes";
import { ordenarPagosDesc, formatearFecha, formatearMonto } from "../../utils/facturacion";

export function Registro() {
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [busqueda, setBusqueda] = useState("");
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

  const pagosOrdenados = ordenarPagosDesc(selectedCliente?.pagos);
  const totalPagado = pagosOrdenados.reduce((acc, p) => acc + (Number(p.monto) || 0), 0);

  const handleEliminarPago = async (index) => {
    if (!window.confirm("¿Eliminar este pago?")) return;
    try {
      const pagosOriginales = selectedCliente.pagos || [];
      const indiceReal = pagosOriginales.indexOf(pagosOrdenados[index]);
      const res = await api.delete(API_ROUTES.PAGOS.DELETE(selectedCliente.id, indiceReal));
      setSelectedCliente(res.data);
      fetchClientes();
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: "danger", texto: "No se pudo eliminar el pago." });
    }
  };

  return (
    <div className="p-4">
      <h3 className="mb-3">Historial de pagos</h3>

      {mensaje && (
        <Alert variant={mensaje.tipo} onClose={() => setMensaje(null)} dismissible>
          {mensaje.texto}
        </Alert>
      )}

      <Form.Control
        type="text"
        className="mb-3"
        style={{ maxWidth: "360px" }}
        placeholder="Buscar por nombre, IP o teléfono…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>IP</th>
            <th>Teléfono</th>
            <th>Total pagado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.map((c) => {
            const total = (c.pagos || []).reduce((acc, p) => acc + (Number(p.monto) || 0), 0);
            return (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.ip || "—"}</td>
                <td>{c.telefono || "—"}</td>
                <td>{formatearMonto(total)}</td>
                <td>
                  <Button
                    variant={selectedCliente?.id === c.id ? "primary" : "outline-primary"}
                    size="sm"
                    onClick={() => setSelectedCliente(c)}
                  >
                    <MdReceipt className="me-1" />
                    Ver pagos
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {clientesFiltrados.length === 0 && <p className="text-muted">No se encontraron clientes.</p>}

      {selectedCliente && (
        <div className="mt-4">
          <h5>
            Pagos de {selectedCliente.nombre}{" "}
            <span className="text-muted fs-6">(total: {formatearMonto(totalPagado)})</span>
          </h5>
          {pagosOrdenados.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Método</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pagosOrdenados.map((pago, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{formatearFecha(pago.fecha)}</td>
                    <td>{formatearMonto(pago.monto)}</td>
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
        </div>
      )}
    </div>
  );
}
