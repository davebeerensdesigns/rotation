import {DefaultSession, DefaultUser} from 'next-auth';
import type {SIWESession} from '@reown/appkit-siwe';

declare module 'next-auth' {
	interface Session extends SIWESession {
		error?: 'RefreshAccessTokenError';
		user: {
			userId: string;
			address: string;
			chainId: string;
			role: string;
			accessToken: string;
			accessTokenExpires: number;
			name?: string | null;
			email?: string | null;
			picture?: string | null;
		} & DefaultSession['user'];
	}
	
	interface User extends DefaultUser {
		// Wel in User, want deze komt uit authorize()
		userId: string;
		address: string;
		chainId: string;
		role: string;
		accessToken: string;
		accessTokenExpires: number;
		refreshToken: string;
		refreshTokenExpires: number;
		name?: string | null;
		email?: string | null;
		picture?: string | null;
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		sub?: string;
		iat?: number;
		exp?: number;
		error?: 'RefreshAccessTokenError';
		userId: string;
		address: string;
		chainId: string;
		role: string;
		accessToken: string;
		accessTokenExpires: number;
		refreshToken: string;
		refreshTokenExpires: number;
		name?: string | null;
		email?: string | null;
		picture?: string | null;
	}
}
