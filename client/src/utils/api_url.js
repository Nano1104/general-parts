
export const API_URL =
    import.meta.env.MODE === 'development'
    ? 'http://localhost:5000' 
    : import.meta.env.VITE_PROD_SERVER_URL;

// Nueva constante para Edge Functions
export const EDGE_API_URL = 
  import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/api' // Usa backend directo en desarrollo
    : '/api/edge'; // Usa ruta relativa en producción