import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Let Next.js handle routing to admin pages where Supabase Auth manages sessions
  // No WWW-Authenticate header is returned, completely preventing the browser popup dialog
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};