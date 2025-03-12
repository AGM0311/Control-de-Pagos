import React from "react";
import "./ItemProductos.scss";

export function ItemProductos({ producto }) {
  return (
    <div className="body">
      <div className="card" style={{ width: "19rem" }}>
        <img
          src={producto.imagen}
          className="card-img-top mx-auto d-block"
          alt={producto.nombre}
          style={{ width: "130px" }}
        />
        <div className="text">
          <h5 className="title">{producto.nombre}</h5>
        </div>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">Número de Arete: {producto.Arete}</li>
          <li className="list-group-item">
            Edad: {producto.Edad}
          </li>
          <li className="list-group-item">
            Peso: {producto.Peso}
          </li>
        </ul>
        <div className="card-body"></div>
      </div>
    </div>
  );
}