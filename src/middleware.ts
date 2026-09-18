import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Only protect routes inside the /admin folder
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization');
    
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      // Replace these with your own secure credentials
      if (user === 'rkics' && pwd === 'admin2026') {
        return NextResponse.next();
      }
    }
    
    // If credentials fail or are missing, trigger the browser's login box
    return new NextResponse('Authentication required to access this area.', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="RKICS Secure Admin Area"'
      }
    });
  }
  
  // Let all public store traffic pass through normally
  return NextResponse.next();
}

// Tell Next.js to only run this middleware on admin routes for performance
export const config = {
  matcher: '/admin/:path*',
};