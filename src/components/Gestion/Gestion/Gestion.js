import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_API } from "../../../utils/constantes";

export function Gestion() {
  const [clientes, setClientes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatos = async () => {
      setLoading(true);
      try {
        const [resClientes, resAlertas] = await Promise.all([
          axios.get(`${BASE_API}/clientes`),
          axios.get(`${BASE_API}/alertas`),
        ]);

        setClientes(Array.isArray(resClientes.data) ? resClientes.data : []);
        setAlertas(Array.isArray(resAlertas.data) ? resAlertas.data : []);
      } catch (err) {
        console.error("Error al cargar clientes o alertas:", err);
        setClientes([]);
        setAlertas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, []);

  if (loading) return <p>Cargando clientes y alertas...</p>;

  const hoy = new Date();

  // Calcula el próximo pago basado en fechaCorte
  const calcularPagoProximo = (cliente) => {
    if (!cliente.fechaCorte) return null;

    // Fecha de corte de este mes
    let fechaVencimiento = new Date(hoy.getFullYear(), hoy.getMonth(), cliente.fechaCorte);

    // Si ya pasó, usar el mes siguiente
    if (fechaVencimiento < hoy) {
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
    }

    const diffDias = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
    return { fechaVencimiento, diffDias };
  };

  // Filtra clientes con pagos próximos (ajustable, ej. 30 días)
  const clientesAVencer = clientes
    .map((c) => {
      const pago = calcularPagoProximo(c);
      return { ...c, pagoProximo: pago };
    })
    .filter((c) => c.pagoProximo && c.pagoProximo.diffDias >= 0 && c.pagoProximo.diffDias <= 30)
    .sort((a, b) => a.pagoProximo.diffDias - b.pagoProximo.diffDias); // orden por proximidad

  return (
    <div className="p-4">
      <h3 className="mb-3">Clientes con pagos próximos y alertas</h3>

      {clientesAVencer.length === 0 ? (
        <p>No hay pagos próximos a vencer.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Plan</th>
              <th>Pago próximo</th>
              <th>Días faltantes</th>
              <th>Alertas</th>
            </tr>
          </thead>
          <tbody>
            {clientesAVencer.map((cliente) => {
              const alertasCliente = alertas.filter(
                (a) => a.clienteId === cliente.id
              );

              return (
                <tr
                  key={cliente.id}
                  style={{
                    backgroundColor:
                      cliente.pagoProximo.diffDias <= 3 ? "#f8d7da" : "transparent", // rojo si vence en 3 días o menos
                  }}
                >
                  <td>{cliente.nombre}</td>
                  <td>{cliente.plan}</td>
                  <td>{cliente.pagoProximo.fechaVencimiento.toLocaleDateString("es-AR")}</td>
                  <td>{cliente.pagoProximo.diffDias}</td>
                  <td>
                    {alertasCliente.length > 0 ? (
                      <ul className="mb-0">
                        {alertasCliente.map((a) => (
                          <li key={a.id}>{a.mensaje}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>Sin alertas</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}