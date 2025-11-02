import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth'; // Assuming better-auth exports this
import { isUserPremium } from '@/lib/subscription-helpers';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Protect dashboard and settings routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings')) {
    if (!session?.user?.id) {
      // Redirect to sign-in if not authenticated
      const url = request.nextUrl.clone();
      url.pathname = '/api/auth/signin';
      return NextResponse.redirect(url);
    }

    const isPremium = await isUserPremium(session.user.id);

    if (!isPremium) {
      // Redirect to pricing page if not a premium user
      const url = request.nextUrl.clone();
      url.pathname = '/pricing';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*'],
};
