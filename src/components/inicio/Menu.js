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
  const [progreso, setProgreso] = useState(null); // porcentaje 0-100
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
          setProgreso(null);
          break;
        case "available":
          setEstado({ tipo: "info", texto: `Nueva versión ${payload.data?.version}: descargando…` });
          setProgreso(0);
          break;
        case "progress":
          setProgreso(Math.round(payload.data?.percent || 0));
          break;
        case "not-available":
          setEstado({ tipo: "success", texto: "Estás al día." });
          setProgreso(null);
          break;
        case "downloaded":
          setEstado({ tipo: "success", texto: "Actualización lista. Reinicia para instalarla." });
          setProgreso(100);
          setActualizacionLista(true);
          break;
        case "error":
          setEstado({ tipo: "danger", texto: `Error: ${payload.data}` });
          setProgreso(null);
          break;
        default:
          break;
      }
    });
  }, [esElectron]);

  const buscarActualizaciones = async () => {
    setBuscando(true);
    setEstado(null);
    setProgreso(null);
    setActualizacionLista(false);
    try {
      const res = await window.electronAPI.checkForUpdates();
      if (res && res.ok === false) {
        setEstado({ tipo: "warning", texto: res.mensaje });
      } else if (res && res.ok && res.version) {
        setEstado({ tipo: "info", texto: `Nueva versión ${res.version}: descargando…` });
        setProgreso(0);
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

  const descargando = progreso !== null && progreso > 0 && progreso < 100;

  return (
    <nav
      className="d-flex flex-column bg-dark text-white p-3 vh-100"
      style={{ width: "180px", position: "fixed", top: 0, left: 0 }}
    >
      <h5 className="text-center mb-1">Servicios Ely</h5>
      {esElectron && (
        <div className="text-center mb-3">
          <span className="badge bg-secondary">v{version || "—"}</span>
        </div>
      )}

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
          {!actualizacionLista && (
            <button
              className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
              onClick={buscarActualizaciones}
              disabled={buscando || descargando}
            >
              <BiRefresh size={16} className={buscando || descargando ? "spin" : ""} />
              {buscando ? "Buscando…" : descargando ? "Descargando…" : "Buscar actualizaciones"}
            </button>
          )}

          {descargando && (
            <div className="mt-2">
              <div className="progress" style={{ height: "8px" }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${progreso}%` }}
                  aria-valuenow={progreso}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
              <div className="small text-center text-info mt-1">{progreso}%</div>
            </div>
          )}

          {actualizacionLista && (
            <button className="btn btn-success btn-sm w-100 mt-2" onClick={instalarAhora}>
              Reiniciar e instalar
            </button>
          )}

          {estado && (
            <div
              className={`small mt-2 text-center text-${
                estado.tipo === "info" ? "info" : estado.tipo
              }`}
            >
              {estado.texto}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
