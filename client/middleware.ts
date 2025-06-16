import NextAuth from 'next-auth';
import authConfig from '@/auth.config';
import {DEFAULT_LOGIN_REDIRECT, DEFAULT_LOGIN_ROUTE, privateRoutes, publicRoutes} from '@/lib/routes';

const {auth} = NextAuth(authConfig);

export default auth((req) => {
	const {nextUrl} = req;
	
	const isAuthenticated = !!req.auth;
	const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
	const isProtectedRoute = privateRoutes.includes(nextUrl.pathname);
	
	if (isPublicRoute && isAuthenticated)
		return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT,
			nextUrl
		));
	
	if (isProtectedRoute && !isAuthenticated)
		return Response.redirect(new URL(DEFAULT_LOGIN_ROUTE,
			nextUrl
		));
});

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};