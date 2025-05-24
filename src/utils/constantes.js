const BASE_API = "http://localhost:3001"; // URL base del servidor

const API_ROUTES = {
  TRABAJADORES: {
    PUT: "/api/trabajadores",
    GET: "/api/trabajadores",
    POST: "/api/trabajadores",
    DELETE: "/api/trabajadores",
  },
  GANADO: {
    GET: "/api/ganado",
    POST: "/api/ganado",
    DELETE: "/api/ganado",
    PUT: "/api/ganado",
  },
  EVENTOS: {
    GET: "/api/eventos",
    POST: "/api/eventos",
    DELETE: "/api/eventos",
    PUT: "/api/eventos",
  },
};

module.exports = { BASE_API, API_ROUTES };
