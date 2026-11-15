// Rutas de la API y constantes de negocio.

export const API_ROUTES = {
  CLIENTES: {
    GET: "/clientes",
    GET_ONE: (id) => `/clientes/${id}`,
    POST: "/clientes",
    PUT: (id) => `/clientes/${id}`,
    DELETE: (id) => `/clientes/${id}`,
  },
  PAGOS: {
    POST: (id) => `/pago/${id}`,
    DELETE: (id, index) => `/pago/${id}/${index}`,
  },
  ALERTAS: {
    GET: "/alertas",
    POST: "/alertas",
    DELETE: (id) => `/alertas/${id}`,
  },
  IMPORTAR: "/importar-clientes",
  RESTAURAR: "/restaurar-clientes",
};

// Métodos de pago disponibles.
export const METODOS_PAGO = ["Efectivo", "Transferencia", "Depósito", "Tarjeta", "Otro"];

// Estados posibles de un cliente.
export const ESTADOS_CLIENTE = ["activo", "suspendido"];
