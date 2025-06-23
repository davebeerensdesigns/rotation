import {Request} from 'express';

export class AuthUtils {
	
	static extractBearerToken(req: Request): string | null {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
		return authHeader.split(' ')[1];
	}
}
