import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

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
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user) {
        // Redirigir a login si no está autenticado
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      }

      // Usuario autenticado, permitir acceso
      return NextResponse.next();
    } catch (error) {
      console.error('Middleware auth error:', error);
      // En caso de error, redirigir a login
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
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
