// src/types/next-auth.d.ts
import {DefaultSession, DefaultUser, User} from 'next-auth';
import type {SIWESession} from '@reown/appkit-siwe';

declare module 'next-auth' {
	// 1) Breid Session uit met SIWESession én jouw extra velden onder user
	interface Session extends SIWESession {
		error?: 'RefreshAccessTokenError';
		user: {
			accessTokenExpires: number;
			accessToken: string;
			userId: string;
			address: string;
			chainId: string;
			role: string;
			name?: string | null;
			email?: string | null;
			picture?: string | null;
		} & DefaultSession['user'];
	}
	
	// 2) Breid ook de User-interface uit, want authorize() retourneert een User
	interface User extends DefaultUser {
		accessToken: string;
		accessTokenExpires: number;
		refreshToken: string;
		userId: string;
		address: string;
		chainId: string;
		role: string;
		name?: string | null;
		email?: string | null;
		picture?: string | null;
	}
}

declare module 'next-auth/jwt' {
	
	interface JWT {
		error?: 'RefreshAccessTokenError';
		
		id: string;
		accessTokenExpires: number;
		accessToken: string;
		refreshToken: string,
		userId: string;
		address: string;
		chainId: string;
		role: string;
		picture?: string | null;
		name?: string | null;
		email?: string | null;
		
		/** Bestaande velden uit NextAuth JWT */
		sub?: string;
		iat?: number;
		exp?: number;
	}
}
