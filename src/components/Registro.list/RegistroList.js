import React from 'react';
import { Button, Table } from 'react-bootstrap';

export function RegistroList({ datos, handleEdit, handleDelete }) {
  
  return (
    <div>
      <h3>Lista de Registros</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Arete</th>
            <th>Peso</th>
            <th>Edad</th>
            <th>Imagen</th>
            <th>Eliminar</th>
            <th>Editar</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((registro, index) => (
            <tr key={registro.id || index}> {/* Use a unique ID if available */}
              <td>{registro.nombre}</td>
              <td>{registro.arete}</td>
              <td>{registro.peso}</td>
              <td>{registro.edad}</td>
              <td>
                {registro.imagen ? (
                  <img src={URL.createObjectURL(registro.imagen)} alt="Imagen del animal" width="100" />
                ) : (
                  'No disponible'
                )}
              </td>
              <td>
                <Button variant="danger" onClick={() => handleDelete(registro.id)}>Eliminar</Button>
              </td>
              <td>
                <Button variant="primary" onClick={() => handleEdit(registro.id)}>Editar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
