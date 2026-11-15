// Lógica de facturación mensual para clientes de internet (ISP).
//
// Cada cliente paga una tarifa mensual y tiene un "día de corte" (fechaCorte,
// un día del 1 al 28). Se considera "al día" si registró al menos un pago en el
// periodo de facturación vigente. Estas funciones centralizan el cálculo para
// que no esté duplicado en los distintos componentes.

const MS_DIA = 1000 * 60 * 60 * 24;

// Día de corte normalizado (entre 1 y 28 para evitar problemas con meses cortos).
export function diaCorte(cliente) {
  const d = Number(cliente?.fechaCorte);
  if (!Number.isInteger(d) || d < 1) return 1;
  return d > 28 ? 28 : d;
}

// Normaliza una fecha a medianoche (sin hora) para comparar días.
function soloDia(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

// Estado de pago de un cliente:
//  - vencimiento: próxima fecha de corte.
//  - diffDias: días que faltan para el próximo corte (siempre >= 0).
//  - vencido: true si ya pasó su corte y no pagó el periodo correspondiente.
//  - diasAtraso: días de atraso (0 si no está vencido).
export function estadoPago(cliente, hoy = new Date()) {
  const corte = diaCorte(cliente);
  const hoyDia = soloDia(hoy);

  const corteEsteMes = new Date(hoy.getFullYear(), hoy.getMonth(), corte);
  const corteMesPasado = new Date(hoy.getFullYear(), hoy.getMonth() - 1, corte);

  const vencimiento = corteEsteMes > hoyDia ? corteEsteMes : new Date(hoy.getFullYear(), hoy.getMonth() + 1, corte);
  const diffDias = Math.round((soloDia(vencimiento) - hoyDia) / MS_DIA);

  let vencido = false;
  let diasAtraso = 0;

  // Si el corte de este mes ya pasó, el cliente debía haber pagado el periodo
  // [corteMesPasado, corteEsteMes). Si no hay pago en ese rango, está vencido.
  if (corteEsteMes <= hoyDia) {
    const pagoEnPeriodo = (cliente?.pagos || []).some((p) => {
      const d = new Date(p.fecha);
      return !Number.isNaN(d.getTime()) && d >= corteMesPasado && d < corteEsteMes;
    });
    if (!pagoEnPeriodo) {
      vencido = true;
      diasAtraso = Math.round((hoyDia - corteEsteMes) / MS_DIA);
    }
  }

  return { vencimiento, diffDias, vencido, diasAtraso };
}

// Suma de los pagos realizados en el mes actual.
export function ingresosDelMes(clientes, hoy = new Date()) {
  let total = 0;
  (clientes || []).forEach((c) => {
    (c.pagos || []).forEach((p) => {
      const d = new Date(p.fecha);
      if (!Number.isNaN(d.getTime()) && d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear()) {
        total += Number(p.monto) || 0;
      }
    });
  });
  return total;
}

// Total cobrado en un periodo arbitrario (por defecto, el mes actual).
export function ingresosEnPeriodo(clientes, desde, hasta) {
  let total = 0;
  (clientes || []).forEach((c) => {
    (c.pagos || []).forEach((p) => {
      const d = new Date(p.fecha);
      if (!Number.isNaN(d.getTime()) && d >= desde && d < hasta) {
        total += Number(p.monto) || 0;
      }
    });
  });
  return total;
}

// Formatea una fecha a "dd/mm/aaaa".
export function formatearFecha(fecha) {
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-MX");
}

// Formatea un monto como moneda.
export function formatearMonto(monto) {
  const n = Number(monto) || 0;
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}
