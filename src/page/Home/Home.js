import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../../api/api";
import { API_ROUTES } from "../../utils/constantes";
import { estadoPago, ingresosDelMes, formatearFecha, formatearMonto } from "../../utils/facturacion";

export function Home() {
  const [clientes, setClientes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const fetchDatos = async () => {
    try {
      const [resClientes, resAlertas] = await Promise.all([
        api.get(API_ROUTES.CLIENTES.GET),
        api.get(API_ROUTES.ALERTAS.GET),
      ]);
      setClientes(Array.isArray(resClientes.data) ? resClientes.data : []);
      setAlertas(Array.isArray(resAlertas.data) ? resAlertas.data : []);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      setClientes([]);
      setAlertas([]);
    }
  };

  useEffect(() => {
    fetchDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clientesConEstado = clientes.map((c) => ({
    ...c,
    estado: estadoPago(c),
    alertasCliente: alertas.filter((a) => a.clienteId === c.id),
  }));

  const activos = clientes.filter((c) => c.estado === "activo").length;
  const suspendidos = clientes.filter((c) => c.estado !== "activo").length;
  const vencidos = clientesConEstado.filter((c) => c.estado.vencido).length;
  const proximosVencer = clientesConEstado.filter((c) => !c.estado.vencido && c.estado.diffDias <= 3).length;
  const ingresosMes = ingresosDelMes(clientes);

  const clientesFiltrados = clientesConEstado
    .filter(
      (c) =>
        (c.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.ip || "").toString().includes(busqueda) ||
        (c.telefono || "").toString().includes(busqueda)
    )
    .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es"));

  const datosEstado = [
    { name: "Activos", value: activos },
    { name: "Suspendidos", value: suspendidos },
  ];
  const COLORS = ["#00C49F", "#FF8042"];

  return (
    <div className="container-fluid">
      <h2 className="mt-4">Panel de control</h2>

      {/* Tarjetas */}
      <div className="row mt-4">
        <Tarjeta titulo="Total de clientes" valor={clientes.length} />
        <Tarjeta titulo="Activos" valor={activos} />
        <Tarjeta titulo="Vencidos" valor={vencidos} color="text-danger" />
        <Tarjeta titulo="Ingresos del mes" valor={formatearMonto(ingresosMes)} />
      </div>

      {/* Gráfica y próximos a vencer */}
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card p-3">
            <h5>Estado de clientes</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={datosEstado} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
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
                  {clientesConEstado
                    .filter((c) => !c.estado.vencido && c.estado.diffDias >= 0 && c.estado.diffDias <= 3)
                    .sort((a, b) => a.estado.diffDias - b.estado.diffDias)
                    .map((c) => (
                      <tr key={c.id} style={{ backgroundColor: "#f8d7da" }}>
                        <td>{c.nombre}</td>
                        <td>{c.ip || "—"}</td>
                        <td>{c.estado.diffDias}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Tabla completa */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card p-3">
            <h5>Todos los clientes ({clientesFiltrados.length})</h5>
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
                  {clientesFiltrados.map((c) => {
                    const { vencido, vencimiento, diffDias, diasAtraso } = c.estado;
                    let bgColor = "transparent";
                    if (vencido) bgColor = "#ffb3b3";
                    else if (diffDias <= 3) bgColor = "#f8d7da";
                    else if (diffDias <= 7) bgColor = "#fff3cd";

                    return (
                      <tr key={c.id} style={{ backgroundColor: bgColor }}>
                        <td>{c.ip || "N/A"}</td>
                        <td>{c.nombre || "Sin nombre"}</td>
                        <td>{c.telefono || "N/A"}</td>
                        <td>{formatearFecha(vencimiento)}</td>
                        <td>{vencido ? `-${diasAtraso}` : diffDias}</td>
                        <td>
                          {c.estado === "activo" ? (
                            <span className="badge bg-success">Activo</span>
                          ) : (
                            <span className="badge bg-secondary">Suspendido</span>
                          )}
                        </td>
                        <td>
                          {c.alertasCliente.length > 0 ? (
                            <span className="badge bg-danger">{c.alertasCliente.length}</span>
                          ) : (
                            <span className="text-muted">0</span>
                          )}
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

function Tarjeta({ titulo, valor, color }) {
  return (
    <div className="col-md-3">
      <div className="card p-3 text-center">
        <h5>{titulo}</h5>
        <h2 className={color || ""}>{valor}</h2>
      </div>
    </div>
  );
}
