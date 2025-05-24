import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Table, Container } from 'react-bootstrap';
import axios from 'axios';
import { MdDelete } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { BASE_API, API_ROUTES } from '../../utils/constantes';

export function UsuariosForm() {
  // Estado para la lista de trabajadores
  const [trabajadores, setTrabajadores] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [trabajadorEditandoId, setTrabajadorEditandoId] = useState(null);

  // Estado para datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    puesto: '',
    // agrega aquí otros campos que tenga un trabajador si aplica
  });

  // Función para obtener los trabajadores desde el backend
  const fetchTrabajadores = async () => {
    try {
      const res = await axios.get(`${BASE_API}${API_ROUTES.TRABAJADORES.GET}`);
      setTrabajadores(res.data);
    } catch (error) {
      console.error('Error al obtener los trabajadores:', error);
    }
  };

  // Maneja el envío del formulario (creación o actualización)
  const handleSubmit = async e => {
    e.preventDefault();

    try {
      if (modoEdicion) {
        // Actualizar trabajador existente
        await axios.put(`${BASE_API}${API_ROUTES.TRABAJADORES.PUT}/${trabajadorEditandoId}`, formData);
      } else {
        // Crear nuevo trabajador
        await axios.post(`${BASE_API}${API_ROUTES.TRABAJADORES.POST}`, formData);
      }

      // Limpiar formulario y estados de edición
      setFormData({ nombre: '', puesto: '' });
      setModoEdicion(false);
      setTrabajadorEditandoId(null);

      // Refrescar la lista
      fetchTrabajadores();

    } catch (error) {
      console.error('Error al guardar trabajador:', error);
    }
  };

  // Cargar datos del trabajador en el formulario para editar
  const handleEdit = trabajador => {
    setFormData({
      nombre: trabajador.nombre || '',
      puesto: trabajador.puesto || '',
      // otros campos si existen
    });
    setModoEdicion(true);
    setTrabajadorEditandoId(trabajador._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Eliminar trabajador
  const handleDelete = async id => {
    try {
      await axios.delete(`${BASE_API}${API_ROUTES.TRABAJADORES.DELETE}/${id}`);
      fetchTrabajadores();
    } catch (error) {
      console.error('Error al eliminar trabajador:', error);
    }
  };

  // Cancelar edición y limpiar formulario
  const handleCancelar = () => {
    setFormData({ nombre: '', puesto: '' });
    setModoEdicion(false);
    setTrabajadorEditandoId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchTrabajadores();
  }, []);

  return (
    <Container className="mt-4">
      <h3 className="fw-bold mb-4 text-center">{modoEdicion ? 'Editar Trabajador' : 'Registrar Trabajador'}</h3>

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md="6">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </Col>

          <Col md="6">
            <Form.Label>Puesto</Form.Label>
            <Form.Control
              type="text"
              value={formData.puesto}
              onChange={e => setFormData({ ...formData, puesto: e.target.value })}
              required
            />
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

      <Table striped bordered hover responsive className="text-center shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Nombre</th>
            <th>Puesto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {trabajadores.map(trabajador => (
            <tr key={trabajador._id}>
              <td>{trabajador.nombre}</td>
              <td>{trabajador.puesto}</td>
              <td>
                <Button 
                  variant="danger" 
                  size="medium" 
                  className="me-2"
                  onClick={() => handleEdit(trabajador)}
                >
                  <FiEdit />
                </Button>
                <Button 
                  variant="primary" 
                  size="medium" 
                  className="me-2"
                  onClick={() => handleEdit(trabajador.id)}
                >
                  <MdDelete />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
