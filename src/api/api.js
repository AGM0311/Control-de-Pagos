import axios from "axios";

// Instancia única de axios para toda la aplicación.
// La URL del backend se puede configurar con la variable de entorno
// REACT_APP_API_URL (útil para la futura app de escritorio).
const BASE_API = process.env.REACT_APP_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: BASE_API,
  timeout: 15000,
});

export default api;
export { BASE_API };
