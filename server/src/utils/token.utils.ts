import dotenv from 'dotenv';

dotenv.config();
import jwt from 'jsonwebtoken';
import {JwtPayload} from '../types/jwt';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRY = parseInt(process.env.ACCESS_TOKEN_EXPIRY || '3600',
	10
);
const REFRESH_TOKEN_EXPIRY = parseInt(process.env.REFRESH_TOKEN_EXPIRY || '604800',
	10
);

if (!JWT_SECRET || !REFRESH_SECRET) {
	console.error('Make sure JWT_SECRET and REFRESH_SECRET .env are present');
	process.exit(1);
}

export const generateTokens = (
	userId: string,
	role: string
): { accessToken: string; refreshToken: string } => {
	const accessToken = jwt.sign(
		{
			sub: userId,
			role
		},
		JWT_SECRET,
		{expiresIn: ACCESS_TOKEN_EXPIRY}
	);
	
	const refreshToken = jwt.sign(
		{
			sub: userId,
			role
		},
		REFRESH_SECRET,
		{expiresIn: REFRESH_TOKEN_EXPIRY}
	);
	
	return {
		accessToken,
		refreshToken
	};
};

export const verifyAccessToken = (token: string): JwtPayload | null => {
	try {
		return jwt.verify(token,
			JWT_SECRET
		) as JwtPayload;
	} catch (error) {
		return null;
	}
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
	try {
		return jwt.verify(token,
			REFRESH_SECRET
		) as JwtPayload;
	} catch (error) {
		return null;
	}
};

export const decodeToken = (token: string): JwtPayload | null => {
	try {
		const decoded = jwt.decode(token);
		if (decoded && typeof decoded === 'object') {
			return decoded as JwtPayload;
		}
		return null;
	} catch {
		return null;
	}
};