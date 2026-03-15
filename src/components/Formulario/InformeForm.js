import React from "react";

export function InformeForm({ cliente }) {
  // Evitar errores si cliente es undefined
  if (!cliente) {
    return <p>Selecciona un cliente para ver el informe.</p>;
  }

  const { nombre, precio, pagos = [] } = cliente;

  return (
    <div className="p-4 border rounded shadow-sm">
      <h3>Informe de {nombre}</h3>
      <p>Precio del plan: ${precio}</p>
      <p>Total de pagos: {pagos.length}</p>

      {pagos.length > 0 ? (
        <table className="table-auto w-full mt-3 border">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-2 py-1 border">Fecha</th>
              <th className="px-2 py-1 border">Monto</th>
              <th className="px-2 py-1 border">Método</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((pago, index) => (
              <tr key={index} className="text-center">
                <td className="px-2 py-1 border">{pago.fecha}</td>
                <td className="px-2 py-1 border">${pago.monto}</td>
                <td className="px-2 py-1 border">{pago.metodo || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-2 text-gray-600">No hay pagos registrados.</p>
      )}
    </div>
  );
}