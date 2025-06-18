import NextAuth, {Session, User} from 'next-auth';
import {JWT} from 'next-auth/jwt';
import authConfig from '@/auth.config';

const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (!nextAuthSecret) {
	throw new Error('NEXTAUTH_SECRET is not set');
}

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
		async jwt({
			user,
			token
		}: { user: User; token: JWT; }): Promise<JWT> {
			
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
			
			if (token.accessTokenExpires && nowInSeconds < token.accessTokenExpires) {
				// Token is nog geldig
				return token;
			}
			
			try {
				console.log('[EXPIRED] sending refresh request');
				const response = await fetch('http://localhost:3001/api/auth/refresh',
					{
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${token.refreshToken}`,
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
				console.log('[EXPIRED] tokens succesfully refreshed');
				return {
					...token,
					accessTokenExpires: newTokens.accessTokenExpires,
					accessToken: newTokens.accessToken
				};
			} catch (error) {
				console.error('[EXPIRED] Error refreshing tokens');
				// If we fail to refresh the token, return an error so we can handle it on the page
				token.error = 'RefreshAccessTokenError';
				return token;
			}
			
			return token;
		},
		async session({
			session,
			token
		}: { session: Session, token: JWT }): Promise<Session> {
			
			if (!token.sub) {
				return session;
			}
			session.error = token.error;
			const [, chainId, address] = token.sub.split(':');
			if (chainId && address) {
				session.address = address;
				session.chainId = parseInt(chainId,
					10
				);
			}
			session.user.id = token.sub;
			session.user.accessTokenExpires = token.accessTokenExpires;
			session.user.accessToken = token.accessToken;
			session.user.userId = token.userId;
			session.user.role = token.role;
			session.user.name = token.name || null;
			session.user.email = token.email || null;
			session.user.picture = token.picture || null;
			
			return session;
		}
	}
});
