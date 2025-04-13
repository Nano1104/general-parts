import { NextResponse } from 'next/server'

export const config = {
  matcher: '/api/:path*', // Aplica solo a rutas de API
}

export function middleware(request) {
  // Ejemplo: Modificar headers para caché
  const response = NextResponse.next()
  response.headers.set('x-edge-function', 'true')
  return response
}