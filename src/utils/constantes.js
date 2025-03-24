// constants.js

const BASE_API = "http://localhost:3001"; // URL base del servidor

const API_ROUTES = {
  TRABAJADORES: {
    BASE: "/api/trabajadores",
    GET: "/api/trabajadores",
    POST: "/api/trabajadores",
    DELETE: "/api/trabajadores/:id",
  },
  GANADO: {
    BASE: "/api/ganado",
    GET: "/api/ganado",
    POST: "/api/ganado",
    DELETE: "/api/ganado/:id",
  },
  EVENTOS: {
    BASE: "/api/eventos",
    GET: "/api/eventos",
    POST: "/api/eventos",
    DELETE: "/api/eventos/:id",
  },
};

module.exports = { BASE_API, API_ROUTES };