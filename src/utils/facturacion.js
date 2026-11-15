// Lógica de facturación mensual para clientes de internet (ISP).
//
// Cada cliente paga una tarifa mensual y tiene un "día de corte" (fechaCorte,
// un día del 1 al 28). Se considera "al día" si su último pago es posterior al
// último corte que debería haber pagado. Estas funciones centralizan el cálculo
// para no duplicarlo entre pantallas.

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
//  - vencido: true si el último corte ya pasó y no registró ningún pago posterior.
//  - diasAtraso: días de atraso (0 si está al día).
//  - ultimoPago: fecha del último pago (o null).
export function estadoPago(cliente, hoy = new Date()) {
  const corte = diaCorte(cliente);
  const hoyDia = soloDia(hoy);

  const corteEsteMes = new Date(hoy.getFullYear(), hoy.getMonth(), corte);
  const corteMesPasado = new Date(hoy.getFullYear(), hoy.getMonth() - 1, corte);

  // Próximo vencimiento (siempre en el futuro).
  const vencimiento = corteEsteMes > hoyDia
    ? corteEsteMes
    : new Date(hoy.getFullYear(), hoy.getMonth() + 1, corte);
  const diffDias = Math.round((soloDia(vencimiento) - hoyDia) / MS_DIA);

  // Último corte: el ciclo que ya debería estar pagado.
  const ultimoCorte = corteEsteMes <= hoyDia ? corteEsteMes : corteMesPasado;

  // Último pago registrado (el más reciente).
  let ultimoPago = null;
  (cliente?.pagos || []).forEach((p) => {
    const d = new Date(p.fecha);
    if (!Number.isNaN(d.getTime()) && (!ultimoPago || d > ultimoPago)) {
      ultimoPago = d;
    }
  });

  // Está al día si pagó a partir del último corte (aunque haya sido tarde).
  const vencido = !ultimoPago || ultimoPago < ultimoCorte;
  const diasAtraso = vencido ? Math.round((hoyDia - soloDia(ultimoCorte)) / MS_DIA) : 0;

  return { vencimiento, diffDias, vencido, diasAtraso, ultimoPago };
}

// Ordena los pagos por fecha, del más reciente al más antiguo.
export function ordenarPagosDesc(pagos) {
  return [...(pagos || [])].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
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

// Total cobrado en un periodo arbitrario.
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

// Fecha de hoy en formato "aaaa-mm-dd" (para el valor de un <input type="date">).
export function hoyISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}
