// Este archivo va en TU FRONTEND (no en el backend de Render)
export const config = {
    runtime: 'edge' // Especifica que es una Edge Function
  };
  
  export default async function handler(request) {
    // 1. Obtener todos los parámetros de la URL original
    const url = new URL(request.url);
    const searchParams = url.searchParams;
  
    // 2. Construir la URL de tu backend en Render
    const backendUrl = new URL('https://general-parts.onrender.com/api/products');
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });
  
    try {
      // 3. Hacer la petición al backend
      const response = await fetch(backendUrl.toString());
  
      // 4. Devolver la respuesta con headers de caché
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
          'CDN-Cache-Control': 'max-age=60'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "Error al obtener productos" 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }