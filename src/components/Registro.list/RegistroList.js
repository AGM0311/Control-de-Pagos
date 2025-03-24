import React from 'react';
import { Table } from 'react-bootstrap';

export function RegistroList({ datos }) {
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
          </tr>
        </thead>
        <tbody>
          {datos.map((registro, index) => (
            <tr key={index}>
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
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
