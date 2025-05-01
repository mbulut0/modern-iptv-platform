import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/login';
  
  // Check if user is authenticated by looking for auth-storage in cookies
  const authCookie = request.cookies.get('auth-storage');
  const isAuthenticated = authCookie?.value ? 
    JSON.parse(decodeURIComponent(authCookie.value)).state.isAuthenticated : false;
  
  // Redirect logic
  if (isPublicPath && isAuthenticated) {
    // If user is authenticated and trying to access login page, redirect to dashboard
    return NextResponse.redirect(new URL('/live', request.url));
  }
  
  if (!isPublicPath && !isAuthenticated) {
    // If user is not authenticated and trying to access protected route, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except for static files, api routes, and _next
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};