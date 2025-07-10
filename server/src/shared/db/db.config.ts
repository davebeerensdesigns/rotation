import dotenv from 'dotenv';

dotenv.config();

export const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://localhost:27017';
export const DB_NAME: string = process.env.MONGODB_DB || 'siwe-auth';
export const REFRESH_TOKEN_EXPIRY_SECONDS: number = parseInt(process.env.REFRESH_TOKEN_EXPIRY || '86400',
	10
);

export const COLLECTIONS = {
	users: 'users',
	sessions: 'sessions',
	nonce: 'nonce'
} as const;
