// Lógica de facturación mensual para clientes de internet (ISP).
//
// Cada cliente paga una tarifa mensual y tiene un "día de corte" (fechaCorte,
// un día del 1 al 28). Se considera "al día" si su último pago es posterior al
// último corte que debería haber pagado. Estas funciones centralizan el cálculo
// para no duplicarlo entre pantallas.

const MS_DIA = 1000 * 60 * 60 * 24;

// Convierte un valor de fecha a una fecha LOCAL a medianoche.
// Importante: new Date("YYYY-MM-DD") lo interpreta como UTC, lo que desplaza la
// fecha varias horas según la zona horaria y rompe las comparaciones con fechas
// locales. Esta función interpreta "YYYY-MM-DD" como fecha local.
function parseFecha(valor) {
  if (valor instanceof Date) return valor;
  if (typeof valor === "string") {
    const m = valor.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Día de corte normalizado (entre 1 y 31).
export function diaCorte(cliente) {
  const d = Number(cliente?.fechaCorte);
  if (!Number.isInteger(d) || d < 1) return 1;
  return d > 31 ? 31 : d;
}

// Normaliza una fecha a medianoche (sin hora) para comparar días.
function soloDia(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

// Fecha del día de corte dentro de un mes concreto. Si el corte es 29, 30 o 31
// y el mes es más corto, se usa el último día de ese mes.
function corteEnMes(anio, mes, corte) {
  const ultimoDia = new Date(anio, mes + 1, 0).getDate();
  return new Date(anio, mes, Math.min(corte, ultimoDia));
}

// Primer día de corte ESTRICTAMENTE posterior a una fecha. Es la fecha en la
// que el cliente debe volver a pagar después de haber pagado en `fecha`.
export function siguienteCorte(fecha, corte) {
  const deEsteMes = corteEnMes(fecha.getFullYear(), fecha.getMonth(), corte);
  if (deEsteMes > fecha) return deEsteMes;
  return corteEnMes(fecha.getFullYear(), fecha.getMonth() + 1, corte);
}

// Estado de pago de un cliente.
//
// El día de corte es fijo para cada cliente y el pago es un hecho aparte. Un
// pago cubre al cliente hasta el siguiente día de corte posterior a la fecha
// del pago. Ejemplos con corte el día 20:
//   - pagó el 20 de octubre  -> su próximo pago vence el 20 de noviembre.
//   - pagó tarde el 25 de octubre -> sigue cubierto hasta el 20 de noviembre.
//   - pagó el 5 de octubre -> vence el 20 de octubre (el corte no cambia).
//
// Si el cliente no tiene ningún pago registrado, se considera vencido desde el
// corte más reciente.
//
//  - vencimiento: fecha en que vence (o venció) el pago.
//  - diffDias: días que faltan para el vencimiento (>= 0).
//  - vencido: true si ya pasó la fecha de vencimiento.
//  - diasAtraso: días transcurridos desde el vencimiento (0 si está al día).
//  - ultimoPago: fecha del último pago (o null).
export function estadoPago(cliente, hoy = new Date()) {
  const corte = diaCorte(cliente);
  const hoyDia = soloDia(hoy);

  // Último pago registrado: el más reciente entre el historial de pagos y el
  // campo "fechaUltimoPago" (útil para cargar datos desde papel).
  let ultimoPago = null;
  (cliente?.pagos || []).forEach((p) => {
    const d = parseFecha(p.fecha);
    if (d && (!ultimoPago || d > ultimoPago)) {
      ultimoPago = d;
    }
  });
  if (cliente?.fechaUltimoPago) {
    const d = parseFecha(cliente.fechaUltimoPago);
    if (d && (!ultimoPago || d > ultimoPago)) {
      ultimoPago = d;
    }
  }

  let vencimiento;
  let diasAtraso = 0;
  let vencido;

  if (ultimoPago) {
    // El pago cubre hasta el siguiente corte después de la fecha de pago.
    vencimiento = siguienteCorte(soloDia(ultimoPago), corte);
    vencido = hoyDia > vencimiento;
    diasAtraso = vencido ? Math.round((hoyDia - vencimiento) / MS_DIA) : 0;
  } else {
    // Sin pagos registrados: vencido desde el corte más reciente.
    const corteEsteMes = corteEnMes(hoy.getFullYear(), hoy.getMonth(), corte);
    const corteMesPasado = corteEnMes(hoy.getFullYear(), hoy.getMonth() - 1, corte);
    const ultimoCorte = corteEsteMes <= hoyDia ? corteEsteMes : corteMesPasado;
    vencimiento = ultimoCorte;
    vencido = true;
    diasAtraso = Math.max(0, Math.round((hoyDia - ultimoCorte) / MS_DIA));
  }

  const diffDias = Math.max(0, Math.round((soloDia(vencimiento) - hoyDia) / MS_DIA));

  return { vencimiento, diffDias, vencido, diasAtraso, ultimoPago, corte };
}

// Ordena los pagos por fecha, del más reciente al más antiguo.
export function ordenarPagosDesc(pagos) {
  return [...(pagos || [])].sort((a, b) => (parseFecha(b.fecha) || 0) - (parseFecha(a.fecha) || 0));
}

// Suma de los pagos realizados en el mes actual.
export function ingresosDelMes(clientes, hoy = new Date()) {
  let total = 0;
  (clientes || []).forEach((c) => {
    (c.pagos || []).forEach((p) => {
      const d = parseFecha(p.fecha);
      if (d && d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear()) {
        total += Number(p.monto) || 0;
      }
    });
  });
  return total;
}

// Suma de los pagos realizados HOY.
export function ingresosDelDia(clientes, hoy = new Date()) {
  let total = 0;
  (clientes || []).forEach((c) => {
    (c.pagos || []).forEach((p) => {
      const d = parseFecha(p.fecha);
      if (
        d &&
        d.getFullYear() === hoy.getFullYear() &&
        d.getMonth() === hoy.getMonth() &&
        d.getDate() === hoy.getDate()
      ) {
        total += Number(p.monto) || 0;
      }
    });
  });
  return total;
}

// Cuántos pagos se registraron HOY.
export function pagosDelDia(clientes, hoy = new Date()) {
  let conteo = 0;
  (clientes || []).forEach((c) => {
    (c.pagos || []).forEach((p) => {
      const d = parseFecha(p.fecha);
      if (
        d &&
        d.getFullYear() === hoy.getFullYear() &&
        d.getMonth() === hoy.getMonth() &&
        d.getDate() === hoy.getDate()
      ) {
        conteo += 1;
      }
    });
  });
  return conteo;
}

// Suma de lo que deben los clientes vencidos (su precio mensual).
export function porCobrar(clientes, hoy = new Date()) {
  let total = 0;
  (clientes || []).forEach((c) => {
    if (estadoPago(c, hoy).vencido) total += Number(c.precio) || 0;
  });
  return total;
}

// Enlace de WhatsApp para un teléfono (devuelve null si no hay número).
// Si se pasa un mensaje, va pre-cargado en el chat. Normaliza el número
// (antepone 52 a números de 10 dígitos).
export function whatsappLink(telefono, mensaje) {
  const t = normalizarTelefono(telefono);
  if (!t) return null;
  const base = `https://wa.me/${t}`;
  if (mensaje) return `${base}?text=${encodeURIComponent(mensaje)}`;
  return base;
}

// Mensaje predeterminado de WhatsApp según el estado de pago del cliente.
export function mensajeWhatsapp(cliente, hoy = new Date()) {
  const nombre = cliente?.nombre || "cliente";
  const plan = cliente?.plan ? ` (${cliente.plan})` : "";
  const estado = estadoPago(cliente, hoy);
  const monto = formatearMonto(Number(cliente?.precio) || 0);

  if (estado.vencido) {
    return `¡Hola ${nombre}! 👋 Te saluda Servicios Ely. Tu pago de internet${plan} está pendiente desde hace ${estado.diasAtraso} días. Monto: ${monto}. ¿Podemos contar con tu pago hoy? ¡Gracias! 🙏`;
  }
  return `¡Hola ${nombre}! 👋 Te saluda Servicios Ely. Te recordamos que tu pago de internet${plan} vence en ${estado.diffDias} días. Monto: ${monto}. ¡Gracias! 🙏`;
}

// Clasifica el atraso de un cliente para mostrar un estado claro.
//  - aldia  : sin atraso
//  - vencido: 1-29 días
//  - moroso : 30-59 días
//  - cronico: 60 o más días
export function clasificarAtraso(cliente, hoy = new Date()) {
  const estado = estadoPago(cliente, hoy);
  if (!estado.vencido) return { nivel: "aldia", etiqueta: "Al día", dias: 0 };
  if (estado.diasAtraso >= 60) return { nivel: "cronico", etiqueta: `Crónico · ${estado.diasAtraso} días`, dias: estado.diasAtraso };
  if (estado.diasAtraso >= 30) return { nivel: "moroso", etiqueta: `Moroso · ${estado.diasAtraso} días`, dias: estado.diasAtraso };
  return { nivel: "vencido", etiqueta: `Vencido · ${estado.diasAtraso} días`, dias: estado.diasAtraso };
}

// Normaliza un teléfono a solo dígitos. Si tiene 10 dígitos (número local
// mexicano sin lada), le antepone el prefijo 52.
export function normalizarTelefono(telefono) {
  let t = (telefono || "").replace(/[^\d]/g, "");
  if (t.length === 10) t = `52${t}`;
  return t;
}

// Total cobrado en un periodo arbitrario.
export function ingresosEnPeriodo(clientes, desde, hasta) {
  let total = 0;
  (clientes || []).forEach((c) => {
    (c.pagos || []).forEach((p) => {
      const d = parseFecha(p.fecha);
      if (d && d >= desde && d < hasta) {
        total += Number(p.monto) || 0;
      }
    });
  });
  return total;
}

// Ingresos por mes (últimos `meses` meses) → [{ mes, etiqueta, total }, ...]
export function ingresosPorMes(clientes, meses = 12, hoy = new Date()) {
  const resultado = [];
  for (let i = meses - 1; i >= 0; i--) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    resultado.push({
      mes: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`,
      etiqueta: fecha.toLocaleDateString("es-MX", { month: "short", year: "2-digit" }),
      total: 0,
    });
  }
  (clientes || []).forEach((c) => {
    (c.pagos || []).forEach((p) => {
      const d = parseFecha(p.fecha);
      if (!d) return;
      const clave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const fila = resultado.find((r) => r.mes === clave);
      if (fila) fila.total += Number(p.monto) || 0;
    });
  });
  return resultado;
}

// Clientes agrupados por plan → [{ plan, cantidad, ingresosMensuales }]
export function clientesPorPlan(clientes) {
  const mapa = {};
  (clientes || []).forEach((c) => {
    const plan = (c.plan || "").trim() || "Sin plan";
    if (!mapa[plan]) mapa[plan] = { plan, cantidad: 0, ingresosMensuales: 0 };
    mapa[plan].cantidad += 1;
    mapa[plan].ingresosMensuales += Number(c.precio) || 0;
  });
  return Object.values(mapa).sort((a, b) => b.cantidad - a.cantidad);
}

// Ingresos agrupados por cobrador (trabajador) → [{ cobrador, cantidad, total }]
export function ingresosPorCobrador(clientes) {
  const mapa = {};
  (clientes || []).forEach((c) => {
    (c.pagos || []).forEach((p) => {
      const nombre = (p.cobrador || "").trim() || "Sin asignar";
      if (!mapa[nombre]) mapa[nombre] = { cobrador: nombre, cantidad: 0, total: 0 };
      mapa[nombre].cantidad += 1;
      mapa[nombre].total += Number(p.monto) || 0;
    });
  });
  return Object.values(mapa).sort((a, b) => b.total - a.total);
}

// Total cobrado histórico (todos los pagos de todos los clientes).
export function ingresosTotales(clientes) {
  let total = 0;
  (clientes || []).forEach((c) => {
    (c.pagos || []).forEach((p) => {
      total += Number(p.monto) || 0;
    });
  });
  return total;
}

// Formatea una fecha a "dd/mm/aaaa".
export function formatearFecha(fecha) {
  const d = parseFecha(fecha);
  if (!d) return "—";
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
