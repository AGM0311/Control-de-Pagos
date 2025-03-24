import React, { useEffect, useState } from "react";
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BASE_API, API_ROUTES } from '../../utils/constantes';

export function Home() {
  const [ganado, setGanado] = useState([]);
  const [eventos, setEventos] = useState([]);

  // Obtener datos del ganado
  const fetchGanado = async () => {
    try {
      const response = await axios.get(`${BASE_API}${API_ROUTES.GANADO.GET}`);
      setGanado(response.data);
    } catch (error) {
      console.error('Error al obtener el ganado:', error);
    }
  };

  // Obtener datos de eventos
  const fetchEventos = async () => {
    try {
      const response = await axios.get(`${BASE_API}${API_ROUTES.EVENTOS.GET}`);
      setEventos(response.data);
    } catch (error) {
      console.error('Error al obtener los eventos:', error);
    }
  };

  // Procesar datos para la gráfica de razas
  const procesarDatosRazas = (ganado) => {
    const razasContador = ganado.reduce((acc, { Raza }) => {
      acc[Raza] = (acc[Raza] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(razasContador).map(([name, Cantidad]) => ({ name, Cantidad }));
  };

  // Procesar datos para la gráfica de vacunación
  const procesarDatosVacunacion = (ganado) => {
    const vacunados = ganado.filter((animal) => animal.vacunado).length;
    const noVacunados = ganado.length - vacunados;

    return [
      { name: 'Vacunadas', value: vacunados },
      { name: 'No Vacunadas', value: noVacunados },
    ];
  };

  // Procesar datos para la gráfica de sexo (machos y hembras)
  const procesarDatosSexo = (ganado) => {
    const machos = ganado.filter((animal) => animal.Sexo === "Macho").length;
    const hembras = ganado.length - machos;

    return [
      { name: 'Machos', value: machos },
      { name: 'Hembras', value: hembras },
    ];
  };

  // Colores para las gráficas de pastel
  const COLORS = ['#00C49F', '#FF8042', '#0088FE', '#FFBB28'];

  // Renderizar etiquetas personalizadas
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Ejecutar las solicitudes al montar el componente
  useEffect(() => {
    fetchGanado();
    fetchEventos();
  }, []);

  // Datos procesados para las gráficas
  const datosGraficaRazas = procesarDatosRazas(ganado);
  const datosGraficaVacunacion = procesarDatosVacunacion(ganado);
  const datosGraficaSexo = procesarDatosSexo(ganado);

  return (
    <div className="container-fluid">
      <h2 className="mt-4">General</h2>

      {/* Primera fila: Gráficas */}
      <div className="row">
        <div className="col-md-6">
          <div className="card p-3">
            <h5>Distribución de razas en el rancho</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosGraficaRazas} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Cantidad" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3">
            <h5>Estado de vacunación</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosGraficaVacunacion}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {datosGraficaVacunacion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Segunda fila: Estadísticas */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card p-3 text-center">
            <h5>Animales registrados</h5>
            <h2>{ganado.length}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 text-center">
            <h5>Proporción de machos y hembras</h5>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={datosGraficaSexo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {datosGraficaSexo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 text-center">
            <h5>Cantidad de pozas</h5>
            <h2>235</h2>
          </div>
        </div>
      </div>

      {/* Tabla de últimos registrados */}
      <h3 className="mt-4">Últimos Registrados</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tipo</th>
            <th>Fecha</th>
            <th>Responsable</th>
          </tr>
        </thead>
        <tbody>
          {eventos.map((evento) => (
            <tr key={evento.id}>
              <td>{evento.id}</td>
              <td>{evento.tipo}</td>
              <td>{evento.fecha}</td>
              <td>{evento.responsable}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}