
export const API_URL =
    import.meta.env.MODE === 'development'
    ? 'http://localhost:5000' 
    : import.meta.env.VITE_PROD_SERVER_URL;