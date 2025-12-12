import { updateSession } from './lib/supabase/middleware';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ['/user', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Check if user is authenticated via Supabase session
    const supabaseResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: request.cookies.get('sb-access-token')?.value
          ? `Bearer ${request.cookies.get('sb-access-token').value}`
          : '',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    }).catch(() => null);

    if (!supabaseResponse || !supabaseResponse.ok) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
