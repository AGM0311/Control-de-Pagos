import React from "react";
import { Link } from "react-router-dom";
import { IoHome } from "react-icons/io5";
import { GiArchiveRegister } from "react-icons/gi";
import { MdOutlineManageHistory } from "react-icons/md";
import { TbAlertTriangleFilled } from "react-icons/tb";
import { BiDollar } from "react-icons/bi";
export function Menu() {
  return (
    <>
      <nav className="d-flex flex-column bg-dark text-white p-3 vh-100 align-items-center" style={{ width: "150px", position: "fixed", top: 0, left: 0 }}>
        <h4 className="text-center">Servicios Ely</h4>
        <Link className="nav-link text-white mt-5 d-flex justify-content-center" to="/">
          <IoHome size={30} />
        </Link>
        <Link className="nav-link text-white mt-5 d-flex justify-content-center" to="/catalogo">
          <GiArchiveRegister  size={30} />
        </Link>
        <Link className="nav-link text-white mt-5 d-flex justify-content-center" to="/usuarios">
          <MdOutlineManageHistory size={30} />
        </Link>
        <Link className="nav-link text-white mt-5 d-flex justify-content-center" to="/gestion">
          <TbAlertTriangleFilled size={30} />
        </Link>
        <Link className="nav-link text-white mt-5 d-flex justify-content-center" to="/informe">
          <BiDollar size={30} />
        </Link>
      </nav>
    </>
  );
}
