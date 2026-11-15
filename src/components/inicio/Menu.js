import React from "react";
import { NavLink } from "react-router-dom";
import { IoHome } from "react-icons/io5";
import { GiArchiveRegister } from "react-icons/gi";
import { MdOutlineManageHistory } from "react-icons/md";
import { TbAlertTriangleFilled } from "react-icons/tb";
import { BiDollar } from "react-icons/bi";
import { BiImport } from "react-icons/bi";

const items = [
  { to: "/", icon: <IoHome size={22} />, label: "Inicio" },
  { to: "/catalogo", icon: <GiArchiveRegister size={22} />, label: "Clientes" },
  { to: "/informe", icon: <BiDollar size={22} />, label: "Pagos" },
  { to: "/gestion", icon: <TbAlertTriangleFilled size={22} />, label: "Cobros" },
  { to: "/usuarios", icon: <MdOutlineManageHistory size={22} />, label: "Historial" },
  { to: "/importar", icon: <BiImport size={22} />, label: "Importar" },
];

export function Menu() {
  return (
    <nav
      className="d-flex flex-column bg-dark text-white p-3 vh-100"
      style={{ width: "180px", position: "fixed", top: 0, left: 0 }}
    >
      <h5 className="text-center mb-4">Servicios Ely</h5>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            `nav-link text-white d-flex align-items-center gap-2 py-2 px-2 rounded ${
              isActive ? "bg-primary" : ""
            }`
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
