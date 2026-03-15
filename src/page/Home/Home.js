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

  // Inicializamos como array vacío
  const [clientes, setClientes] = useState([]);

  /* ======================
     OBTENER CLIENTES
  ====================== */
  const fetchClientes = async () => {
    try {
      const res = await axios.get(`${API}/clientes`);
      // Aseguramos que siempre sea un array
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      setClientes([]);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  /* ======================
     DATOS PARA GRAFICAS
  ====================== */
  const activos = clientes.filter(c => c.estado === "activo").length;
  const suspendidos = clientes.filter(c => c.estado !== "activo").length;

  const datosEstado = [
    { name: "Activos", value: activos },
    { name: "Suspendidos", value: suspendidos }
  ];

  /* ======================
     CLIENTES POR FECHA
  ====================== */
  const clientesPorMes = clientes.reduce((acc, c) => {
    if (!c.fechaPago) return acc;
    const mes = c.fechaPago.substring(0, 7); // YYYY-MM
    acc[mes] = (acc[mes] || 0) + 1;
    return acc;
  }, {});

  /* ======================
     CLIENTES POR VENCER
  ====================== */
  const hoy = new Date();
  const vencidos = clientes.filter(c => {
    if (!c.fechaCorte) return false;
    const fechaCorte = new Date(c.fechaCorte);
    return fechaCorte < hoy;
  }).length;

  /* ======================
     COLORES GRAFICA
  ====================== */
  const COLORS = ["#00C49F", "#FF8042"];

  return (
    <div className="container-fluid">
      <h2 className="mt-4">Dashboard</h2>

      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card p-3 text-center">
            <h5>Total de clientes</h5>
            <h2>{clientes.length}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 text-center">
            <h5>Clientes vencidos</h5>
            <h2>{vencidos}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 text-center">
            <h5>Clientes activos</h5>
            <h2>{activos}</h2>
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
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {datosEstado.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3">
            <h5>Últimos clientes registrados</h5>
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>IP</th>
                  <th>Fecha Pago</th>
                </tr>
              </thead>
              <tbody>
                {clientes
                  .slice(-5)
                  .reverse()
                  .map(c => (
                    <tr key={c.id}>
                      <td>{c.nombre || "Sin nombre"}</td>
                      <td>{c.telefono || "N/A"}</td>
                      <td>{c.ip || "N/A"}</td>
                      <td>{c.fechaPago || "N/A"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}