export { auth as middleware } from '@/lib/auth';

export const config = {
  // Exclude NextAuth routes, static assets, and API routes from middleware
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
