import dotenv from 'dotenv';

dotenv.config();

import jwt from 'jsonwebtoken';
import {JwtPayload} from '../types/jwt';
import {Request} from 'express';

export class SessionUtils {
	private static instance: SessionUtils;
	
	private readonly jwtSecret: string;
	private readonly refreshSecret: string;
	private readonly accessTokenExpiry: number;
	private readonly refreshTokenExpiry: number;
	
	private constructor() {
		this.jwtSecret = process.env.JWT_SECRET || '';
		this.refreshSecret = process.env.REFRESH_SECRET || '';
		this.accessTokenExpiry = parseInt(process.env.ACCESS_TOKEN_EXPIRY || '600',
			10
		);
		this.refreshTokenExpiry = parseInt(process.env.REFRESH_TOKEN_EXPIRY || '86400',
			10
		);
		
		if (!this.jwtSecret || !this.refreshSecret) {
			console.error('Make sure JWT_SECRET and REFRESH_SECRET are present in .env');
			process.exit(1);
		}
	}
	
	// ✅ Singleton accessor
	public static getInstance(): SessionUtils {
		if (!SessionUtils.instance) {
			SessionUtils.instance = new SessionUtils();
		}
		return SessionUtils.instance;
	}
	
	public extractBearerToken(req: Request): string | null {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
		return authHeader.split(' ')[1];
	}
	
	public generateTokens(
		userId: string,
		role: string,
		sessionId: string,
		visitorId: string
	): { accessToken: string; refreshToken: string } {
		const accessToken = jwt.sign({
				sub: userId,
				role,
				sessionId,
				visitorId
			},
			this.jwtSecret,
			{
				expiresIn: this.accessTokenExpiry
			}
		);
		
		const refreshToken = jwt.sign({
				sub: userId,
				role,
				sessionId,
				visitorId
			},
			this.refreshSecret,
			{
				expiresIn: this.refreshTokenExpiry
			}
		);
		
		return {
			accessToken,
			refreshToken
		};
	}
	
	public verifyAccessToken(token: string): JwtPayload | null {
		try {
			return jwt.verify(token,
				this.jwtSecret
			) as JwtPayload;
		} catch {
			return null;
		}
	}
	
	public verifyRefreshToken(token: string): JwtPayload | null {
		try {
			return jwt.verify(token,
				this.refreshSecret
			) as JwtPayload;
		} catch {
			return null;
		}
	}
	
	public decodeToken(token: string): JwtPayload | null {
		try {
			const decoded = jwt.decode(token);
			if (decoded && typeof decoded === 'object') {
				return decoded as JwtPayload;
			}
			return null;
		} catch {
			return null;
		}
	}
	
}
