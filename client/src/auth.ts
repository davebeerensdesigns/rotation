import NextAuth, {Session, User} from 'next-auth';
import {JWT} from 'next-auth/jwt';
import authConfig from '@/auth.config';

/**
 * The NEXTAUTH_SECRET environment variable must be set for secure JWT encryption.
 * Throws an error during startup if missing.
 */
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (!nextAuthSecret) {
	throw new Error('NEXTAUTH_SECRET is not set');
}

/**
 * Initializes NextAuth authentication and exports standard handlers and helpers.
 *
 * Exports:
 * - GET: NextAuth GET handler
 * - POST: NextAuth POST handler
 * - auth: Middleware-compatible function for protecting routes
 * - signIn: Client helper to trigger sign-in
 * - signOut: Client helper to trigger sign-out
 */
export const {
	handlers: {
		GET,
		POST
	},
	auth,
	signIn,
	signOut
} = NextAuth({
	secret: nextAuthSecret,
	session: {
		strategy: 'jwt'
	},
	...authConfig,
	callbacks: {
		/**
		 * Custom JWT callback to persist access token and refresh it if expired.
		 *
		 * @param {Object} param
		 * @param {User} param.user - The user object (only on login).
		 * @param {JWT} param.token - The current JWT token object.
		 * @returns {Promise<JWT>} The updated JWT token.
		 */
		async jwt({
			user,
			token,
			trigger,
			session
		}: {
			token: JWT;
			user: User;
			trigger?: 'signIn' | 'signUp' | 'update' | undefined;
			session?: Session;
		}): Promise<JWT> {
			// Initial sign-in: merge user data into token
			if (trigger === 'update' && session?.user) {
				token.name = session.user.name ?? token.name ?? null;
				token.email = session.user.email ?? token.email ?? null;
				token.picture = session.user.picture ?? token.picture ?? null;
			}
			if (user) {
				token.address = user.address;
				token.chainId = user.chainId;
				token.accessToken = user.accessToken;
				token.accessTokenExpires = user.accessTokenExpires;
				token.refreshToken = user.refreshToken;
				token.refresTokenExpires = user.refreshTokenExpires;
				token.userId = user.userId;
				token.role = user.role;
				token.name = user.name || null;
				token.email = user.email || null;
				token.picture = user.picture || null;
			}
			
			const nowInSeconds = Math.floor(Date.now() / 1000);
			
			// Access token still valid
			if (token.accessTokenExpires && nowInSeconds < token.accessTokenExpires) {
				return token;
			}
			
			// Refresh token expired
			if (token.refreshTokenExpires && nowInSeconds > token.refreshTokenExpires) {
				return {
					...token,
					error: 'RefreshAccessTokenError'
				};
			}
			
			// Access token expired — try refresh
			try {
				const response = await fetch('http://localhost:3001/api/session/refresh',
					{
						method: 'POST',
						headers: {
							Authorization: `Bearer ${token.refreshToken}`,
							'Content-Type': 'application/json'
						}
					}
				);
				
				const json = await response.json();
				
				if (json.status !== 'success') {
					return {
						...token,
						error: 'RefreshAccessTokenError'
					};
				}
				
				return {
					...token,
					accessTokenExpires: json.data.accessTokenExpires,
					accessToken: json.data.accessToken
				};
			} catch (error) {
				return {
					...token,
					error: 'RefreshAccessTokenError'
				};
			}
		},
		
		/**
		 * Custom session callback to include token data in the session.
		 *
		 * @param {Object} param
		 * @param {Session} param.session - The session object returned to the client.
		 * @param {JWT} param.token - The JWT token object.
		 * @returns {Promise<Session>} The updated session object.
		 */
		async session({
			session,
			token
		}: { session: Session; token: JWT }): Promise<Session> {
			
			const [, chainNumber] = token.chainId.split(':');
			const parsedChainId = parseInt(chainNumber,
				10
			);
			session.error = token.error;
			session.address = token.address;
			session.chainId = parsedChainId;
			session.user.address = token.address;
			session.user.chainId = token.chainId;
			session.user.accessToken = token.accessToken;
			session.user.accessTokenExpires = token.accessTokenExpires;
			session.user.userId = token.userId;
			session.user.role = token.role;
			session.user.name = token.name || null;
			session.user.email = token.email || null;
			session.user.picture = token.picture || null;
			
			return session;
		}
	}
});
