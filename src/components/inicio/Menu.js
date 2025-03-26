import React from "react";
import { Link } from "react-router-dom";

export function Menu() {
  return (
    <>
      <nav className="d-flex flex-column bg-dark text-white p-3 vh-100" style={{ width: "200px", position: "fixed", top: 0, left: 0 }}>
        <h4 className="text-center">BARRA DE HERRAMIENTAS</h4>
        <Link className="nav-link text-white mt-3" to="/">
          Home
        </Link>
        <Link className="nav-link text-white mt-3" to="/catalogo">
          Catalogo
        </Link>
        <Link className="nav-link text-white mt-3" to="/usuarios">
          Usuarios
        </Link>
        <Link className="nav-link text-white mt-3" to="/gestion">
           Gestion
        </Link>
        <Link className="nav-link text-white mt-3" to="/informe">
          Informe
        </Link>
      </nav>
    </>
  );
}
