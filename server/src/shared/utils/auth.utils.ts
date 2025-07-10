import dotenv from 'dotenv';
import {Request} from 'express';

dotenv.config();

export class AuthUtils {
	private static instance: AuthUtils;
	
	private constructor() {
	}
	
	public static getInstance(): AuthUtils {
		if (!AuthUtils.instance) {
			AuthUtils.instance = new AuthUtils();
		}
		return AuthUtils.instance;
	}
	
	public extractBearerToken(req: Request): string | null {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return null;
		}
		return authHeader.split(' ')[1];
	}
}
