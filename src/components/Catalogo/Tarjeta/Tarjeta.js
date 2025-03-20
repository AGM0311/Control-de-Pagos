import React from "react";
import "./Tarjeta.scss";

export function Tarjeta({ catalogo }) {
  return (
    <div className="body">
      <div className="card" style={{ width: "19rem" }}>
        <img
          src={catalogo.imagen}
          className="card-img-top mx-auto d-block"
          alt={catalogo.nombre}
          style={{ width: "130px" }}
        />
        <div className="text">
          <h5 className="title">{catalogo.nombre}</h5>
        </div>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">Número de Arete: {catalogo.Arete}</li>
          <li className="list-group-item">
            Edad: {catalogo.Edad}
          </li>
          <li className="list-group-item">
            Peso: {catalogo.Peso}
          </li>
        </ul>
        <div className="card-body"></div>
      </div>
    </div>
  );
}