import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Table } from 'react-bootstrap';
import axios from 'axios';
import { MdDelete } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { BASE_API } from '../../utils/constantes';

export function Registro() {
  const [clientes, setClientes] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    telefono: '',
    ip: '',
    plan: '',
    precio: 0,
    fechaCorte: 1,
    estado: 'activo',
    pagos: [] // aseguramos que siempre exista
  });

  // Obtener clientes
  const fetchClientes = async () => {
    try {
      const res = await axios.get(`${BASE_API}/clientes`);
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      setClientes([]);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Guardar o actualizar cliente
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (modoEdicion && formData.id) {
        // Editar cliente existente
        await axios.put(`${BASE_API}/clientes/${formData.id}`, formData);
      } else {
        // Crear nuevo cliente
        const dataToSend = { ...formData };
        delete dataToSend.id; // no enviar id al crear
        await axios.post(`${BASE_API}/clientes`, dataToSend);
      }

      // Reiniciar formulario
      setFormData({
        id: null,
        nombre: '',
        telefono: '',
        ip: '',
        plan: '',
        precio: 0,
        fechaCorte: 1,
        estado: 'activo',
        pagos: []
      });
      setModoEdicion(false);

      // Refrescar lista
      fetchClientes();
    } catch (error) {
      console.error("Error al guardar cliente:", error.response?.data || error.message);
    }
  };

  const handleEdit = cliente => {
    setFormData({
      id: cliente.id || null,
      nombre: cliente.nombre || '',
      telefono: cliente.telefono || '',
      ip: cliente.ip || '',
      plan: cliente.plan || '',
      precio: cliente.precio || 0,
      fechaCorte: cliente.fechaCorte || 1,
      estado: cliente.estado || 'activo',
      pagos: cliente.pagos || []
    });
    setModoEdicion(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async id => {
    try {
      await axios.delete(`${BASE_API}/clientes/${id}`);
      fetchClientes();
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
    }
  };

  const handleCancelar = () => {
    setFormData({
      id: null,
      nombre: '',
      telefono: '',
      ip: '',
      plan: '',
      precio: 0,
      fechaCorte: 1,
      estado: 'activo',
      pagos: []
    });
    setModoEdicion(false);
  };

  return (
    <div className="p-4">
      <h3 className="fw-bold mb-4 text-center">
        {modoEdicion ? 'Editar Cliente' : 'Registrar Cliente'}
      </h3>

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md="3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
            />
          </Col>
          <Col md="3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              value={formData.telefono}
              onChange={e => setFormData({ ...formData, telefono: e.target.value })}
            />
          </Col>
          <Col md="3">
            <Form.Label>IP</Form.Label>
            <Form.Control
              type="text"
              value={formData.ip}
              onChange={e => setFormData({ ...formData, ip: e.target.value })}
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md="3">
            <Form.Label>Plan</Form.Label>
            <Form.Control
              type="text"
              value={formData.plan}
              onChange={e => setFormData({ ...formData, plan: e.target.value })}
            />
          </Col>
          <Col md="3">
            <Form.Label>Precio</Form.Label>
            <Form.Control
              type="number"
              value={formData.precio}
              onChange={e => setFormData({ ...formData, precio: Number(e.target.value) })}
            />
          </Col>
          <Col md="3">
            <Form.Label>Día de corte</Form.Label>
            <Form.Control
              type="number"
              value={formData.fechaCorte}
              onChange={e => setFormData({ ...formData, fechaCorte: Number(e.target.value) })}
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md="3">
            <Form.Label>Estado</Form.Label>
            <Form.Select
              value={formData.estado}
              onChange={e => setFormData({ ...formData, estado: e.target.value })}
            >
              <option value="activo">Activo</option>
              <option value="suspendido">Suspendido</option>
            </Form.Select>
          </Col>
        </Row>

        <Row className="mb-3">
          <Button type="submit">{modoEdicion ? 'Actualizar' : 'Registrar'}</Button>
          {modoEdicion && (
            <Button variant="secondary" onClick={handleCancelar} className="ms-2">
              Cancelar
            </Button>
          )}
        </Row>
      </Form>

      <hr />

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>IP</th>
            <th>Plan</th>
            <th>Precio</th>
            <th>Corte</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(clientes) && clientes.map(cliente => (
            <tr key={cliente.id}>
              <td>{cliente.nombre}</td>
              <td>{cliente.telefono}</td>
              <td>{cliente.ip}</td>
              <td>{cliente.plan}</td>
              <td>${cliente.precio}</td>
              <td>{cliente.fechaCorte}</td>
              <td>{cliente.estado}</td>
              <td>
                <Button variant="warning" onClick={() => handleEdit(cliente)}><FiEdit /></Button>{' '}
                <Button variant="danger" onClick={() => handleDelete(cliente.id)}><MdDelete /></Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}