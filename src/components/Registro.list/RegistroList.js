import React, { useState, useEffect } from 'react';
import { Button, Table } from 'react-bootstrap';
import axios from 'axios';
import { BASE_API, API_ROUTES } from '../../utils/constantes';
import { MdDelete } from "react-icons/md";
import { FiEdit } from "react-icons/fi";


export function RegistroList({ handleEdit, handleDelete }) {
    const [ganado, setGanado] = useState([]);

    useEffect(() => {
        fetchGanado();
    }, []);

    const fetchGanado = async () => {
        try {
            const response = await axios.get(`${BASE_API}${API_ROUTES.GANADO.GET}`);
            setGanado(response.data);
        } catch (error) {
            console.error('Error al obtener el ganado:', error);
        }
    };

    return (
        <div className="container mt-2 small">
    <h3 className="text-center mb-2">Lista de Registros</h3>
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <Table striped bordered hover responsive className="text-center table-sm" style={{ minWidth: '1000px' }}>
            <thead className="table-dark">
                <tr>
                    <th>Nombre</th>
                    <th>Arete</th>
                    <th>Edad</th>
                    <th>Peso (kg)</th>
                    <th>Raza</th>
                    <th>Color</th>
                    <th>Sexo</th>
                    <th>Propietario</th>
                    <th>Ubicación</th>
                    <th>Vacunado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {ganado.map((animal, index) => (
                    <tr key={animal.id || index}>
                        <td>{animal.Nombre}</td>
                        <td>{animal.Arete}</td>
                        <td>{animal.Edad}</td>
                        <td>{animal.Peso}</td>
                        <td>{animal.Raza}</td>
                        <td>{animal.Color}</td>
                        <td>{animal.Sexo}</td>
                        <td>{animal.Propietario}</td>
                        <td>{animal.Ubicacion}</td>
                        <td>
                            <span className={`badge ${animal.vacunado ? 'bg-success' : 'bg-danger'}`}>
                                {animal.vacunado ? 'SI' : 'NO'}
                            </span>
                        </td>
                        <td>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(animal.id)}>
                                <MdDelete /> Eliminar
                            </Button>
                            <Button variant="outline-primary" size="sm" onClick={() => handleEdit(animal.id)}>
                                <FiEdit /> Editar
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    </div>
</div>
    );
}
