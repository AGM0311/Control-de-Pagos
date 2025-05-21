import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Container } from 'react-bootstrap';
import { BASE_API, API_ROUTES } from '../../utils/constantes';

export function UsuariosForm({ handleEdit, handleDelete }) {
  const [trabajadores, setTrabajadores] = useState([]);

  useEffect(() => {
    fetchTrabajadores();
  }, []);

  const fetchTrabajadores = async () => {
    try {
      const response = await axios.get(`${BASE_API}${API_ROUTES.TRABAJADORES.GET}`);
      setTrabajadores(response.data);
    } catch (error) {
      console.error('Error al obtener los trabajadores:', error);
    }
  };

  return (
    <Container className="mt-4">
      <h3 className="text-center mb-4">Usuarios</h3>
      <Table striped bordered hover responsive className="text-center shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Nombre</th>
            <th>Puesto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {trabajadores.map((trabajador, index) => (
            <tr key={trabajador.id || index}>
              <td>{trabajador.nombre}</td>
              <td>{trabajador.puesto}</td>
              <td>
                <Button 
                  variant="danger" 
                  size="medium" 
                  className="me-2"
                  onClick={() => handleDelete(trabajador.id)}
                >
                  Eliminar
                </Button>
                <Button 
                  variant="primary" 
                  size="medium" 
                  className="me-2"
                  onClick={() => handleEdit(trabajador.id)}
                >
                  Modificar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}