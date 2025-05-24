import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, InputGroup, Table } from 'react-bootstrap';
import axios from 'axios';
import { MdDelete } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { BASE_API, API_ROUTES } from '../../utils/constantes';

export function Registro() {
  const [ganado, setGanado] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [animalEditandoId, setAnimalEditandoId] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '', arete: 0, edad: 0, peso: 0, raza: '', color: '', sexo: '', propietario: '', ubicacion: '', vacunado: false
  });

  const fetchGanado = async () => {
    const res = await axios.get(`${BASE_API}${API_ROUTES.GANADO.GET}`);
    console.log(res);
    setGanado(res.data);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (modoEdicion) {
      await axios.put(`${BASE_API}${API_ROUTES.GANADO.PUT}/${animalEditandoId}`, formData);
    } else {
      await axios.post(`${BASE_API}${API_ROUTES.GANADO.POST}`, formData);
    }

    setFormData({ nombre: '', arete: 0, edad: 0, peso: 0, raza: '', color: '', sexo: '', propietario: '', ubicacion: '', vacunado: false });
    setModoEdicion(false);
    setAnimalEditandoId(null);
    fetchGanado();
  };

  const handleEdit = animal => {
    setFormData({
      nombre: animal.nombre || '',
      arete: animal.arete || 0,
      edad: animal.edad || 0,
      peso: animal.peso || 0,
      raza: animal.raza || '',
      color: animal.color || '',
      sexo: animal.sexo || '',
      propietario: animal.propietario || '',
      ubicacion: animal.ubicacion || '',
      vacunado: animal.vacunado || false,
    });

    
    setModoEdicion(true);
    setAnimalEditandoId(animal._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async id => {
    await axios.delete(`${BASE_API}${API_ROUTES.GANADO.DELETE}/${id}`);
    fetchGanado();
  };

  const handleCancelar = () => {
    setFormData({
      nombre: '', arete: 0, edad: 0, peso: 0, raza: '', color: '', sexo: '', propietario: '', ubicacion: '', vacunado: false
    });
    setModoEdicion(false);
    setAnimalEditandoId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => { fetchGanado(); }, []);

  return (
    <div className="p-4">
      <h3 className="fw-bold mb-4 text-center">{modoEdicion ? 'Editar Animal' : 'Registrar Animal'}</h3>

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md="3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control type="text" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
          </Col>

          <Col md="3">
            <Form.Label>Arete</Form.Label>
            <Form.Control type="number" value={formData.arete} onChange={e => setFormData({ ...formData, arete: Number(e.target.value) })} />
          </Col>

          <Col md="3">
            <Form.Label>Peso (kg)</Form.Label>
            <InputGroup>
              <Form.Control type="number" value={formData.peso} onChange={e => setFormData({ ...formData, peso: Number(e.target.value) })} />
              <InputGroup.Text>kg</InputGroup.Text>
            </InputGroup>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md="3">
            <Form.Label>Edad</Form.Label>
            <Form.Control type="number" value={formData.edad} onChange={e => setFormData({ ...formData, edad: Number(e.target.value) })} />
          </Col>

          <Col md="3">
            <Form.Label>Raza</Form.Label>
            <Form.Control type="text" value={formData.raza} onChange={e => setFormData({ ...formData, raza: e.target.value })} />
          </Col>

          <Col md="3">
            <Form.Label>Color</Form.Label>
            <Form.Control type="text" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md="3">
            <Form.Label>Sexo</Form.Label>
            <Form.Select value={formData.sexo} onChange={e => setFormData({ ...formData, sexo: e.target.value })}>
              <option value="">Seleccionar...</option>
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </Form.Select>
          </Col>

          <Col md="3">
            <Form.Label>Propietario</Form.Label>
            <Form.Control type="text" value={formData.propietario} onChange={e => setFormData({ ...formData, propietario: e.target.value })} />
          </Col>

          <Col md="3">
            <Form.Label>Ubicación</Form.Label>
            <Form.Control type="text" value={formData.ubicacion} onChange={e => setFormData({ ...formData, ubicacion: e.target.value })} />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md="3" className="d-flex align-items-center">
            <Form.Check type="checkbox" label="Vacunado" checked={formData.vacunado} onChange={e => setFormData({ ...formData, vacunado: e.target.checked })} />
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
            <th>Nombre</th><th>Arete</th><th>Raza</th><th>Sexo</th><th>Peso</th><th>Edad</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ganado.map(animal => (
            <tr key={animal._id}>
              <td>{animal.nombre}</td>
              <td>{animal.arete}</td>
              <td>{animal.raza}</td>
              <td>{animal.sexo}</td>
              <td>{animal.peso}</td>
              <td>{animal.edad}</td>
              <td>
                <Button variant="warning" onClick={() => handleEdit(animal)}><FiEdit /></Button>{' '}
                <Button variant="danger" onClick={() => handleDelete(animal._id)}><MdDelete /></Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
