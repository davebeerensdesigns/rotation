import NextAuth from 'next-auth';
import authConfig from '@/auth.config';
import {DEFAULT_LOGIN_REDIRECT, DEFAULT_LOGIN_ROUTE, privateRoutes, publicRoutes} from '@/lib/routes';

const {auth} = NextAuth(authConfig);

/**
 * Middleware that handles route-based authentication logic.
 *
 * Redirects authenticated users away from public pages,
 * and redirects unauthenticated users away from protected routes.
 *
 * @param {import('next/server').NextRequest} req - The incoming Next.js request object.
 * @returns {Response | undefined} A redirect response if route access is denied, otherwise undefined.
 */
export default auth((req) => {
	const {nextUrl} = req;
	
	const isAuthenticated = !!req.auth;
	const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
	const isProtectedRoute = privateRoutes.includes(nextUrl.pathname);
	
	if (isPublicRoute && isAuthenticated) {
		return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT,
			nextUrl
		));
	}
	
	if (isProtectedRoute && !isAuthenticated) {
		return Response.redirect(new URL(DEFAULT_LOGIN_ROUTE,
			nextUrl
		));
	}
});

/**
 * Configuration for the middleware matcher.
 *
 * This ensures that only non-static and non-API routes
 * are processed by the authentication middleware.
 *
 * @type {{ matcher: string[] }}
 */
export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
