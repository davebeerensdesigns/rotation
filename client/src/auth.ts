import NextAuth, {Session, User} from 'next-auth';
import {JWT} from 'next-auth/jwt';
import authConfig from '@/auth.config';
import {AdapterUser} from '@auth/core/adapters';

const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (!nextAuthSecret) {
	throw new Error('NEXTAUTH_SECRET is not set');
}
const serverUrl = process.env.SERVER_DOMAIN;
if (!serverUrl) {
	throw new Error('SERVER_DOMAIN is not set');
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
			token,
			user,
			trigger,
			session
		}: {
			token: JWT;
			user: User | AdapterUser;
			trigger?: 'signIn' | 'signUp' | 'update' | undefined;
			session?: Session
		}): Promise<JWT | null> {
			const now = Math.floor(Date.now() / 1000);
			
			if (trigger === 'update' && session?.user) {
				token.name = session.user.name ?? token.name ?? null;
				token.email = session.user.email ?? token.email ?? null;
				token.picture = session.user.picture ?? token.picture ?? null;
			}
			
			if (trigger === 'update' && session?.error) {
				token.error = session.error ?? token.error ?? undefined;
			}
			
			if (user) {
				token.userId = user.userId;
				token.address = user.address;
				token.chainId = user.chainId;
				token.role = user.role;
				token.accessToken = user.accessToken;
				token.accessTokenExpires = user.accessTokenExpires;
				token.refreshToken = user.refreshToken;
				token.refreshTokenExpires = user.refreshTokenExpires;
				token.name = user.name ?? null;
				token.email = user.email ?? null;
				token.picture = user.picture ?? null;
			}
			
			if (token.accessTokenExpires && now < token.accessTokenExpires) {
				return token;
			}
			
			if (token.refreshTokenExpires && now > token.refreshTokenExpires) {
				return null;
			}
			
			try {
				const backendRes = await fetch(`${serverUrl}/api/session/refresh`,
					{
						method: 'POST',
						headers: {
							Authorization: `Bearer ${token.refreshToken}`,
							'Content-Type': 'application/json'
						}
					}
				);
				const json = await backendRes.json();
				
				if (json.status !== 'success') {
					return null;
				}
				
				return {
					...token,
					accessToken: json.data.accessToken,
					accessTokenExpires: json.data.accessTokenExpires
				};
			} catch {
				return null;
			}
		},
		async session({
			session,
			token
		}: { session: Session, token: JWT }) {
			const chainPart = token.chainId ?? 'eip155:0';
			const [, chainNumber] = chainPart.split(':');
			const parsedChainId = parseInt(chainNumber,
				10
			);
			
			session.error = token.error;
			session.address = token.address;
			session.chainId = parsedChainId;
			
			session.user.userId = token.userId;
			session.user.address = token.address;
			session.user.chainId = token.chainId;
			session.user.role = token.role;
			session.user.accessToken = token.accessToken;
			session.user.accessTokenExpires = token.accessTokenExpires;
			session.user.name = token.name ?? null;
			session.user.email = token.email ?? null;
			session.user.picture = token.picture ?? null;
			
			return session;
		}
	},
	events: {
		async signOut(message) {
			if ('token' in message && message.token) {
				const {
					refreshToken
				} = message.token;
				
				try {
					if (refreshToken) {
						await fetch(`${serverUrl}/api/session/logout`,
							{
								method: 'POST',
								headers: {
									'Authorization': `Bearer ${refreshToken}`,
									'Content-Type': 'application/json'
								}
							}
						);
					}
					
					console.log('[signOut] JWT session revoked');
				} catch (e) {
					console.error('[signOut] Revoke failed',
						e
					);
				}
			}
			
		}
	}
});
