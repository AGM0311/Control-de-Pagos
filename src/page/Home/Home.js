import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Datos de ejemplo para la gráfica
const data = [
  {
    name: 'Juan',
    Vacas_atendidas: 40,
  },
  {
    name: 'Carlos',
    Vacas_atendidas: 30,
  },
  {
    name: 'Pedro',
    Vacas_atendidas: 20,
  },
  {
    name: 'Jose',
    Vacas_atendidas: 27,
  },
  {
    name: 'AXL',
    Vacas_atendidas: 19,
  }
];

export function Home() {
  return (
    <div className="container-fluid">
      {/* Título principal */}
      <h2 className="mt-4">Informe General</h2>

      {/* Primera fila de contenido */}
      <div className="row">
        {/* Columna 1: Gráfica de barras */}
        <div className="col-md-6">
          <div className="card p-3">
            <h5>Vacas atendidas por trabajador</h5>
            {/* Gráfica de barras */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Vacas_atendidas" fill="#82ca9d" activeBar={<Rectangle fill="gold" stroke="purple" />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Columna 2: Imagen de gráfica */}
        <div className="col-md-6">
          <div className="card p-3">
            <h5>Tipo de ganado</h5>
            <img src="/images/grafica2.png" className="img-fluid" alt="Gráfico 2" />
          </div>
        </div>
      </div>

      {/* Segunda fila de contenido */}
      <div className="row mt-4">
        {/* Columna 1: Animales registrados */}
        <div className="col-md-4">
          <div className="card p-3 text-center">
            <h5>Animales registrados</h5>
            <h2>468</h2>
          </div>
        </div>

        {/* Columna 2: Vacas vacunadas */}
        <div className="col-md-4">
          <div className="card p-3 text-center">
            <h5>Vacas vacunadas</h5>
            <img src="/images/grafica3.png" className="img-fluid" alt="Gráfico 3" />
          </div>
        </div>

        {/* Columna 3: Cantidad de pozas */}
        <div className="col-md-4">
          <div className="card p-3 text-center">
            <h5>Cantidad de pozas</h5>
            <h2>235</h2>
          </div>
        </div>
      </div>

      {/* Tabla de últimos registrados */}
      <h3 className="mt-4">Últimos Registrados</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Categoría</th>
            <th>Dueño</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Vaca_001</td>
            <td>Registro</td>
            <td>Identificación</td>
            <td>Juan Pérez</td>
            <td>ACTIVO</td>
          </tr>
          <tr>
            <td>Toro_A2</td>
            <td>Registro</td>
            <td>Reproducción</td>
            <td>Mario López</td>
            <td>EN REVISIÓN</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}