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
        <div className="container mt-3">
            <h3 className="text-center mb-3 fw-bold">Lista de Registros</h3>

            <div style={{ maxHeight: '400px', overflowY: 'auto', overflowX: 'auto' }}>
                <Table 
                    striped 
                    bordered 
                    hover 
                    responsive 
                    className="text-center table-sm"
                    style={{ borderRadius: '10px', overflow: 'hidden', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}
                >
                    <thead className="table-dark">
                        <tr>
                            <th style={{ width: "12%" }}>Nombre</th>
                            <th style={{ width: "10%" }}>Arete</th>
                            <th style={{ width: "8%" }}>Edad</th>
                            <th style={{ width: "8%" }}>Peso (kg)</th>
                            <th style={{ width: "10%" }}>Raza</th>
                            <th style={{ width: "10%" }}>Color</th>
                            <th style={{ width: "8%" }}>Sexo</th>
                            <th style={{ width: "12%" }}>Propietario</th>
                            <th style={{ width: "10%" }}>Ubicación</th>
                            <th style={{ width: "8%" }}>Vacunado</th>
                            <th style={{ width: "14%" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ganado.map((animal) => (
                            <tr key={animal.id}>
                                <td>{animal.nombre}</td>
                                <td>{animal.Arete}</td>
                                <td>{animal.Edad}</td>
                                <td>{animal.Peso}</td>
                                <td>{animal.Raza}</td>
                                <td>{animal.Color}</td>
                                <td>{animal.Sexo}</td>
                                <td>{animal.Propietario}</td>
                                <td>{animal.Ubicación}</td>
                                <td>
                                    <span 
                                        className={`badge px-3 py-2 text-white ${animal.vacunado ? 'bg-success' : 'bg-danger'}`} 
                                        style={{ borderRadius: '8px', fontSize: '0.9em' }}
                                    >
                                        {animal.vacunado ? ' Sí' : ' No'}
                                    </span>
                                </td>
                                <td>
                                    <Button 
                                        variant="outline-danger" 
                                        size="sm" 
                                        className="me-2" 
                                        style={{ borderRadius: '8px', fontWeight: 'bold' }}
                                        onClick={() => handleDelete(animal.id)}
                                    >
                                        <MdDelete /> Eliminar
                                    </Button>
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm" 
                                        style={{ borderRadius: '8px', fontWeight: 'bold' }}
                                        onClick={() => handleEdit(animal.id)}
                                    >
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
