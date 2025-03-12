import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export function Home() {
  return (
    <div className="container-fluid">
      <h2 className="mt-4">Informe General</h2>
      <div className="row">
        <div className="col-md-6">
          <div className="card p-3">
            <h5>Vacas atendidas por trabajador</h5>
            <img src="/images/grafica1.png" className="img-fluid" alt="Gráfico 1" />
          </div>
        </div>
        <div className="col-md-6">
          <div className="card p-3">
            <h5>Tipo de ganado</h5>
            <img src="/images/grafica2.png" className="img-fluid" alt="Gráfico 2" />
          </div>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card p-3 text-center">
            <h5>Animales registrados</h5>
            <h2>468</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 text-center">
            <h5>Vacas vacunadas</h5>
            <img src="/images/grafica3.png" className="img-fluid" alt="Gráfico 3" />
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 text-center">
            <h5>Cantidad de pozas</h5>
            <h2>235</h2>
          </div>
        </div>
      </div>
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
