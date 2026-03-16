import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export function Home() {

  const API = "http://localhost:3001";

  const [clientes, setClientes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  // Obtener clientes
  const fetchClientes = async () => {
    try {
      const res = await axios.get(`${API}/clientes`);
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      setClientes([]);
    }
  };

  // Obtener alertas
  const fetchAlertas = async () => {
    try {
      const res = await axios.get(`${API}/alertas`);
      setAlertas(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al obtener alertas:", error);
      setAlertas([]);
    }
  };

  useEffect(() => {
    fetchClientes();
    fetchAlertas();
  }, []);

  const hoy = new Date();

  // Próximo pago
  const calcularPagoProximo = (cliente) => {

    if (!cliente.fechaCorte) return null;

    let fechaVencimiento = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      cliente.fechaCorte
    );

    if (fechaVencimiento < hoy) {
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
    }

    const diffDias = Math.ceil(
      (fechaVencimiento - hoy) / (1000 * 60 * 60 * 24)
    );

    return { fechaVencimiento, diffDias };
  };

  const clientesConPago = clientes.map(c => ({
    ...c,
    pagoProximo: calcularPagoProximo(c),
    alertasCliente: alertas.filter(a => a.clienteId === c.id)
  }));

  // Busqueda
  const clientesFiltrados = clientesConPago
    .filter(c =>
      (c.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.ip || "").toString().includes(busqueda) ||
      (c.telefono || "").toString().includes(busqueda)
    )
    .sort((a, b) => Number(a.ip) - Number(b.ip));

  // Conteos
  const activos = clientes.filter(c => c.estado === "activo").length;
  const inactivos = clientes.filter(c => c.estado !== "activo").length;

  const vencidos = clientesConPago.filter(
    c => c.pagoProximo?.diffDias < 0
  ).length;

  const proximosVencer = clientesConPago.filter(
    c => c.pagoProximo?.diffDias >= 0 && c.pagoProximo?.diffDias <= 3
  ).length;

  // Datos gráfica
  const datosEstado = [
    { name: "Activos", value: activos },
    { name: "Inactivos", value: inactivos }
  ];

  const COLORS = ["#00C49F", "#FF8042"];

  return (
    <div className="container-fluid">

      <h2 className="mt-4">Dashboard de Clientes</h2>

      {/* TARJETAS */}
      <div className="row mt-4">

        <div className="col-md-3">
          <div className="card p-3 text-center">
            <h5>Total de clientes</h5>
            <h2>{clientes.length}</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 text-center">
            <h5>Activos</h5>
            <h2>{activos}</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 text-center">
            <h5>Inactivos</h5>
            <h2>{inactivos}</h2>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 text-center">
            <h5>Vencidos</h5>
            <h2>{vencidos}</h2>
          </div>
        </div>

      </div>

      {/* GRAFICA */}
      <div className="row mt-4">

        <div className="col-md-6">

          <div className="card p-3">

            <h5>Estado de clientes</h5>

            <ResponsiveContainer width="100%" height={300}>

              <PieChart>

                <Pie
                  data={datosEstado}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >

                  {datosEstado.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}

                </Pie>

                <Tooltip />
                <Legend verticalAlign="bottom" />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>

        <div className="col-md-6">

          <div className="card p-3">

            <h5>Clientes próximos a vencer (0-3 días)</h5>

            {proximosVencer === 0 ? (
              <p>No hay clientes próximos a vencer</p>
            ) : (

              <table className="table">

                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>IP</th>
                    <th>Días</th>
                  </tr>
                </thead>

                <tbody>

                  {clientesConPago
                    .filter(c =>
                      c.pagoProximo?.diffDias >= 0 &&
                      c.pagoProximo?.diffDias <= 3
                    )
                    .sort((a, b) =>
                      a.pagoProximo.diffDias - b.pagoProximo.diffDias
                    )
                    .map(c => (

                      <tr key={c.id} style={{ backgroundColor: "#f8d7da" }}>

                        <td>{c.nombre}</td>
                        <td>{c.ip}</td>
                        <td>{c.pagoProximo?.diffDias}</td>

                      </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

        </div>

      </div>

      {/* TABLA COMPLETA DE CLIENTES */}

      <div className="row mt-4">

        <div className="col-md-12">

          <div className="card p-3">

            <h5>Todos los Clientes ({clientesFiltrados.length})</h5>

            <input
              type="text"
              className="form-control mb-3"
              placeholder="Buscar por nombre, IP o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <div style={{ maxHeight: "600px", overflowY: "auto" }}>

              <table className="table table-striped table-hover">

                <thead className="table-dark">

                  <tr>
                    <th>IP</th>
                    <th>Nombre</th>
                    <th>Teléfono</th>
                    <th>Próximo pago</th>
                    <th>Días</th>
                    <th>Estado</th>
                    <th>Alertas</th>
                  </tr>

                </thead>

                <tbody>

                  {clientesFiltrados.map(c => {

                    const diffDias = c.pagoProximo?.diffDias ?? null;

                    let bgColor = "transparent";

                    if (diffDias !== null) {
                      if (diffDias < 0) bgColor = "#ffb3b3";
                      else if (diffDias <= 3) bgColor = "#f8d7da";
                      else if (diffDias <= 7) bgColor = "#fff3cd";
                    }

                    return (

                      <tr key={c.id} style={{ backgroundColor: bgColor }}>

                        <td>{c.ip || "N/A"}</td>

                        <td>{c.nombre || "Sin nombre"}</td>

                        <td>{c.telefono || "N/A"}</td>

                        <td>
                          {c.pagoProximo?.fechaVencimiento
                            ?.toLocaleDateString("es-MX") || "N/A"}
                        </td>

                        <td>
                          {diffDias !== null ? diffDias : "N/A"}
                        </td>

                        <td>
                          {c.estado === "activo"
                            ? <span className="badge bg-success">Activo</span>
                            : <span className="badge bg-secondary">Inactivo</span>
                          }
                        </td>

                        <td>
                          {c.alertasCliente.length > 0
                            ? <span className="badge bg-danger">{c.alertasCliente.length}</span>
                            : <span className="text-muted">0</span>
                          }
                        </td>

                      </tr>

                    );

                  })}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}