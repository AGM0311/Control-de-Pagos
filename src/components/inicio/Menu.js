import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { IoHome } from "react-icons/io5";
import { GiArchiveRegister } from "react-icons/gi";
import { MdOutlineManageHistory } from "react-icons/md";
import { TbAlertTriangleFilled } from "react-icons/tb";
import { BiDollar, BiImport, BiRefresh } from "react-icons/bi";

const items = [
  { to: "/", icon: <IoHome size={22} />, label: "Inicio" },
  { to: "/catalogo", icon: <GiArchiveRegister size={22} />, label: "Clientes" },
  { to: "/informe", icon: <BiDollar size={22} />, label: "Pagos" },
  { to: "/gestion", icon: <TbAlertTriangleFilled size={22} />, label: "Cobros" },
  { to: "/usuarios", icon: <MdOutlineManageHistory size={22} />, label: "Historial" },
  { to: "/importar", icon: <BiImport size={22} />, label: "Importar" },
];

export function Menu() {
  const [version, setVersion] = useState("");
  const [estado, setEstado] = useState(null); // { tipo, texto }
  const [buscando, setBuscando] = useState(false);
  const [actualizacionLista, setActualizacionLista] = useState(false);

  const esElectron = typeof window !== "undefined" && !!window.electronAPI;

  useEffect(() => {
    if (!esElectron) return;

    window.electronAPI.getVersion().then((v) => setVersion(v || ""));

    window.electronAPI.onUpdateStatus((payload) => {
      if (!payload) return;
      switch (payload.channel) {
        case "checking":
          setEstado({ tipo: "info", texto: "Buscando actualizaciones…" });
          break;
        case "available":
          setEstado({ tipo: "info", texto: `Nueva versión ${payload.data?.version}: descargando…` });
          break;
        case "not-available":
          setEstado({ tipo: "success", texto: "Estás al día." });
          break;
        case "downloaded":
          setEstado({ tipo: "success", texto: "Actualización lista. Reinicia para instalarla." });
          setActualizacionLista(true);
          break;
        case "error":
          setEstado({ tipo: "danger", texto: `Error: ${payload.data}` });
          break;
        default:
          break;
      }
    });
  }, [esElectron]);

  const buscarActualizaciones = async () => {
    setBuscando(true);
    setEstado(null);
    setActualizacionLista(false);
    try {
      const res = await window.electronAPI.checkForUpdates();
      if (res && res.ok === false) {
        setEstado({ tipo: "warning", texto: res.mensaje });
      } else if (res && res.ok && res.version) {
        setEstado({ tipo: "info", texto: `Nueva versión ${res.version}: descargando…` });
      }
    } catch (e) {
      setEstado({ tipo: "danger", texto: "No se pudo buscar actualizaciones." });
    } finally {
      setBuscando(false);
    }
  };

  const instalarAhora = async () => {
    try {
      await window.electronAPI.installUpdate();
    } catch (e) {
      setEstado({ tipo: "danger", texto: "No se pudo instalar la actualización." });
    }
  };

  return (
    <nav
      className="d-flex flex-column bg-dark text-white p-3 vh-100"
      style={{ width: "180px", position: "fixed", top: 0, left: 0 }}
    >
      <h5 className="text-center mb-4">Servicios Ely</h5>

      <div className="d-flex flex-column gap-1">
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
      </div>

      {esElectron && (
        <div className="mt-auto pt-3 border-top border-secondary">
          <div className="small text-muted text-center mb-2">Versión {version || "—"}</div>

          {!actualizacionLista && (
            <button
              className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
              onClick={buscarActualizaciones}
              disabled={buscando}
            >
              <BiRefresh size={16} className={buscando ? "spin" : ""} />
              {buscando ? "Buscando…" : "Buscar actualizaciones"}
            </button>
          )}

          {actualizacionLista && (
            <button className="btn btn-success btn-sm w-100" onClick={instalarAhora}>
              Reiniciar e instalar
            </button>
          )}

          {estado && (
            <div className={`small mt-2 text-center text-${estado.tipo === "info" ? "info" : estado.tipo}`}>
              {estado.texto}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
