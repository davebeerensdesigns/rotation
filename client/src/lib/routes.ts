/**
 * List of routes that are publicly accessible without authentication.
 *
 * Used to allow access to pages like home, login, or about without requiring a session.
 *
 * @type {string[]}
 */
export const publicRoutes = [
	'/'
];

/**
 * List of routes that require the user to be authenticated.
 *
 * Middleware will redirect unauthenticated users to the login route.
 *
 * @type {string[]}
 */
export const privateRoutes = [
	'/profile'
];

/**
 * Default route users are redirected to if they try to access a protected page without being logged in.
 *
 * Typically this would be a login page or home page.
 *
 * @type {string}
 */
export const DEFAULT_LOGIN_ROUTE = '/';

/**
 * Default route users are redirected to after successful login.
 *
 * Typically this would be a dashboard, profile page, or main app route.
 *
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = '/profile';
