import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren autenticación
const protectedRoutes = [
  '/dashboard',
  '/analytics',
  '/settings',
  '/team',
  '/onboarding',
];

// Rutas públicas
const publicRoutes = [
  '/login',
  '/register',
  '/api/auth',
  '/',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acceso a rutas públicas y archivos estáticos
  if (
    publicRoutes.some(route => pathname.startsWith(route)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Verificar autenticación para rutas protegidas
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Verificar si hay una cookie de sesión de Better Auth
    const sessionToken = request.cookies.get('better-auth.session_token');
    
    if (!sessionToken) {
      // Redirigir a login si no hay cookie de sesión
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Si hay cookie, permitir acceso (la verificación real se hará en el componente)
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
