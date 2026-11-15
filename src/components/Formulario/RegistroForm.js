import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col, Table, Alert, Modal } from "react-bootstrap";
import { MdDelete, MdNotifications, MdOutlineAddComment } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import api from "../../api/api";
import { API_ROUTES, ESTADOS_CLIENTE } from "../../utils/constantes";
import { estadoPago, formatearFecha, formatearMonto, whatsappLink, mensajeWhatsapp, normalizarTelefono } from "../../utils/facturacion";

const FORM_VACIO = {
  id: null,
  nombre: "",
  telefono: "",
  ip: "",
  plan: "",
  precio: "",
  fechaCorte: 1,
  estado: "activo",
  fechaUltimoPago: "",
};

export function Registro() {
  const [clientes, setClientes] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [formData, setFormData] = useState(FORM_VACIO);

  // Alertas / notas por cliente
  const [clienteNotas, setClienteNotas] = useState(null);
  const [notas, setNotas] = useState([]);
  const [notaTexto, setNotaTexto] = useState("");
  const [mostrarNotas, setMostrarNotas] = useState(false);

  const fetchNotas = async (clienteId) => {
    try {
      const res = await api.get(API_ROUTES.ALERTAS.GET);
      const todas = Array.isArray(res.data) ? res.data : [];
      setNotas(todas.filter((a) => a.clienteId === clienteId));
    } catch (error) {
      console.error("Error al obtener notas:", error);
      setNotas([]);
    }
  };

  const abrirNotas = (cliente) => {
    setClienteNotas(cliente);
    setNotaTexto("");
    fetchNotas(cliente.id);
    setMostrarNotas(true);
  };

  const agregarNota = async () => {
    if (!notaTexto.trim()) return;
    try {
      await api.post(API_ROUTES.ALERTAS.POST, { clienteId: clienteNotas.id, mensaje: notaTexto.trim() });
      setNotaTexto("");
      fetchNotas(clienteNotas.id);
    } catch (error) {
      console.error("Error al agregar nota:", error);
    }
  };

  const eliminarNota = async (id) => {
    try {
      await api.delete(API_ROUTES.ALERTAS.DELETE(id));
      fetchNotas(clienteNotas.id);
    } catch (error) {
      console.error("Error al eliminar nota:", error);
    }
  };

  const fetchClientes = async () => {
    try {
      const res = await api.get(API_ROUTES.CLIENTES.GET);
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      setClientes([]);
    }
  };

  useEffect(() => {
    fetchClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    const datos = {
      ...formData,
      precio: Number(formData.precio) || 0,
      fechaCorte: Number(formData.fechaCorte) || 1,
      telefono: normalizarTelefono(formData.telefono),
    };

    try {
      if (modoEdicion && formData.id) {
        await api.put(API_ROUTES.CLIENTES.PUT(formData.id), datos);
        setMensaje({ tipo: "success", texto: "Cliente actualizado correctamente." });
      } else {
        await api.post(API_ROUTES.CLIENTES.POST, datos);
        setMensaje({ tipo: "success", texto: "Cliente registrado correctamente." });
      }
      setFormData(FORM_VACIO);
      setModoEdicion(false);
      fetchClientes();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      setMensaje({
        tipo: "danger",
        texto: error.response?.data?.errores?.join(" · ") || "No se pudo guardar el cliente.",
      });
    }
  };

  const handleEdit = (cliente) => {
    setFormData({
      id: cliente.id,
      nombre: cliente.nombre || "",
      telefono: cliente.telefono || "",
      ip: cliente.ip || "",
      plan: cliente.plan || "",
      precio: cliente.precio ?? "",
      fechaCorte: cliente.fechaCorte || 1,
      estado: cliente.estado || "activo",
      fechaUltimoPago: cliente.fechaUltimoPago || "",
    });
    setModoEdicion(true);
    setMensaje(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este cliente? Esta acción no se puede deshacer.")) return;
    try {
      await api.delete(API_ROUTES.CLIENTES.DELETE(id));
      fetchClientes();
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      setMensaje({ tipo: "danger", texto: "No se pudo eliminar el cliente." });
    }
  };

  const handleCancelar = () => {
    setFormData(FORM_VACIO);
    setModoEdicion(false);
    setMensaje(null);
  };

  const filtro = busqueda.trim().toLowerCase();

  const clientesConEstado = clientes
    .map((c) => ({ ...c, estadoPago: estadoPago(c) }))
    .filter((c) => {
      if (filtroEstado === "activo") return c.estado === "activo";
      if (filtroEstado === "suspendido") return c.estado === "suspendido";
      if (filtroEstado === "vencido") return c.estadoPago.vencido;
      return true;
    })
    .filter(
      (c) =>
        !filtro ||
        (c.nombre || "").toLowerCase().includes(filtro) ||
        (c.ip || "").toString().toLowerCase().includes(filtro) ||
        (c.telefono || "").toString().toLowerCase().includes(filtro)
    )
    .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es"));

  return (
    <div className="p-4">
      <h3 className="fw-bold mb-4 text-center">
        {modoEdicion ? "Editar Cliente" : "Registrar Cliente"}
      </h3>

      {mensaje && (
        <Alert variant={mensaje.tipo} onClose={() => setMensaje(null)} dismissible>
          {mensaje.texto}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              value={formData.nombre}
              required
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </Col>
          <Col md={3}>
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            />
          </Col>
          <Col md={3}>
            <Form.Label>IP</Form.Label>
            <Form.Control
              type="text"
              value={formData.ip}
              onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={3}>
            <Form.Label>Plan</Form.Label>
            <Form.Control
              type="text"
              value={formData.plan}
              placeholder="Ej. fibra 50 Mb"
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            />
          </Col>
          <Col md={3}>
            <Form.Label>Precio mensual ($)</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
            />
          </Col>
          <Col md={3}>
            <Form.Label>Día de corte</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="28"
              value={formData.fechaCorte}
              onChange={(e) => setFormData({ ...formData, fechaCorte: e.target.value })}
            />
          </Col>
          <Col md={3}>
            <Form.Label>Estado</Form.Label>
            <Form.Select
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            >
              {ESTADOS_CLIENTE.map((estado) => (
                <option key={estado} value={estado}>
                  {estado === "activo" ? "Activo" : "Suspendido"}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <Row className="mb-4 align-items-end">
          <Col md={3}>
            <Form.Label>Último pago</Form.Label>
            <Form.Control
              type="date"
              value={formData.fechaUltimoPago}
              onChange={(e) => setFormData({ ...formData, fechaUltimoPago: e.target.value })}
            />
            <Form.Text className="text-muted">
              Para cargar pagos desde tu registro en papel.
            </Form.Text>
          </Col>
          <Col>
            <Button type="submit" variant="primary">
              {modoEdicion ? "Actualizar" : "Registrar"}
            </Button>
            {modoEdicion && (
              <Button variant="secondary" onClick={handleCancelar} className="ms-2">
                Cancelar
              </Button>
            )}
          </Col>
        </Row>
      </Form>

      <hr />

      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <Button
          size="sm"
          variant={filtroEstado === "" ? "primary" : "outline-primary"}
          onClick={() => setFiltroEstado("")}
        >
          Todos
        </Button>
        <Button
          size="sm"
          variant={filtroEstado === "activo" ? "primary" : "outline-primary"}
          onClick={() => setFiltroEstado("activo")}
        >
          Activos
        </Button>
        <Button
          size="sm"
          variant={filtroEstado === "vencido" ? "danger" : "outline-danger"}
          onClick={() => setFiltroEstado("vencido")}
        >
          Vencidos
        </Button>
        <Button
          size="sm"
          variant={filtroEstado === "suspendido" ? "secondary" : "outline-secondary"}
          onClick={() => setFiltroEstado("suspendido")}
        >
          Suspendidos
        </Button>
        <span className="text-muted ms-auto">
          Mostrando {clientesConEstado.length} de {clientes.length}
        </span>
      </div>

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
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>IP</th>
            <th>Plan</th>
            <th>Precio</th>
            <th>Corte</th>
            <th>Último pago</th>
            <th>Próximo pago</th>
            <th>Días</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientesConEstado.map((cliente) => {
            const { vencimiento, diffDias, vencido } = cliente.estadoPago;

            let bgColor = "transparent";
            if (vencido) bgColor = "#f8d7da";
            else if (diffDias <= 3) bgColor = "#fff3cd";

            return (
              <tr key={cliente.id} style={{ backgroundColor: bgColor }}>
                <td>{cliente.nombre}</td>
                <td>{cliente.telefono || "—"}</td>
                <td>{cliente.ip || "—"}</td>
                <td>{cliente.plan || "—"}</td>
                <td>{formatearMonto(cliente.precio)}</td>
                <td>{cliente.fechaCorte}</td>
                <td>{cliente.fechaUltimoPago ? formatearFecha(cliente.fechaUltimoPago) : "—"}</td>
                <td>{formatearFecha(vencimiento)}</td>
                <td>
                  {vencido ? (
                    <span className="badge bg-danger">Vencido {cliente.estadoPago.diasAtraso} días</span>
                  ) : (
                    <span className="text-muted">{diffDias} días</span>
                  )}
                </td>
                <td>
                  {cliente.estado === "activo" ? (
                    <span className="badge bg-success">Activo</span>
                  ) : (
                    <span className="badge bg-secondary">Suspendido</span>
                  )}
                </td>
                <td>
                  {whatsappLink(cliente.telefono) && (
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => window.open(whatsappLink(cliente.telefono, mensajeWhatsapp(cliente)), "_blank")}
                      title="Enviar WhatsApp"
                    >
                      <FaWhatsapp />
                    </Button>
                  )}
                  <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(cliente)}>
                    <FiEdit />
                  </Button>
                  <Button variant="info" size="sm" className="me-2" onClick={() => abrirNotas(cliente)} title="Notas / alertas">
                    <MdNotifications />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(cliente.id)}>
                    <MdDelete />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {clientesConEstado.length === 0 && <p className="text-muted">No hay clientes registrados todavía.</p>}

      {/* Modal de notas / alertas */}
      <Modal show={mostrarNotas} onHide={() => setMostrarNotas(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Notas de {clienteNotas?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {notas.length > 0 ? (
            <ul className="list-group mb-3">
              {notas.map((n) => (
                <li key={n.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{n.mensaje}</span>
                  <Button variant="outline-danger" size="sm" onClick={() => eliminarNota(n.id)}>
                    <MdDelete />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Sin notas todavía.</p>
          )}

          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="Escribe una nota o alerta…"
              value={notaTexto}
              onChange={(e) => setNotaTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  agregarNota();
                }
              }}
            />
            <Button variant="primary" onClick={agregarNota} disabled={!notaTexto.trim()}>
              <MdOutlineAddComment className="me-1" />
              Añadir
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
