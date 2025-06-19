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
			token
		}: { user: User; token: JWT }): Promise<JWT> {
			// Initial sign-in: merge user data into token
			if (user) {
				token.sub = user.id;
				token.accessTokenExpires = user.accessTokenExpires;
				token.accessToken = user.accessToken;
				token.refreshToken = user.refreshToken;
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
			
			// Access token expired — try refresh
			try {
				console.log('[EXPIRED] sending refresh request');
				const response = await fetch('http://localhost:3001/api/auth/refresh',
					{
						method: 'POST',
						headers: {
							Authorization: `Bearer ${token.refreshToken}`,
							'Content-Type': 'application/json'
						}
					}
				);
				
				const {data: tokensOrError} = await response.json();
				
				if (!response.ok) throw tokensOrError;
				
				const newTokens = tokensOrError as {
					accessToken: string;
					accessTokenExpires: number;
				};
				
				console.log('[EXPIRED] tokens successfully refreshed');
				
				return {
					...token,
					accessTokenExpires: newTokens.accessTokenExpires,
					accessToken: newTokens.accessToken
				};
			} catch (error) {
				console.error('[EXPIRED] Error refreshing tokens');
				token.error = 'RefreshAccessTokenError';
				return token;
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
			if (!token.sub) {
				return session;
			}
			
			session.error = token.error;
			
			// Parse "did:pkh:eip155:1:0xabc..." structure
			const [, chainId, address] = token.sub.split(':');
			if (chainId && address) {
				session.address = address;
				session.chainId = parseInt(chainId,
					10
				);
			}
			
			session.user.id = token.sub;
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
