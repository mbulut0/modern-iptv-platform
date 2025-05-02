import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Skip middleware for API routes and static files
  if (path.startsWith('/api/') || 
      path.includes('/_next/') || 
      path.includes('/favicon.ico')) {
    return NextResponse.next();
  }
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/';
  
  console.log('Middleware processing path:', path, 'isPublicPath:', isPublicPath);
  
  // We can't access localStorage in middleware, so we'll use a cookie
  // This is a simplified check - in production you'd use a JWT or session cookie
  const authCookie = request.cookies.get('auth-token');
  let isAuthenticated = false;
  
  if (authCookie?.value) {
    console.log('Auth token cookie found');
    isAuthenticated = true;
  } else {
    console.log('No auth token cookie found');
  }
  
  // Redirect logic
  if (isPublicPath && isAuthenticated) {
    // If user is authenticated and trying to access login page, redirect to dashboard
    console.log('Redirecting authenticated user from public path to dashboard');
    return NextResponse.redirect(new URL('/live', request.url));
  }
  
  if (!isPublicPath && !isAuthenticated) {
    // If user is not authenticated and trying to access protected route, redirect to login
    console.log('Redirecting unauthenticated user to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  console.log('Middleware allowing request to proceed');
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except for static files, api routes, and _next
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};