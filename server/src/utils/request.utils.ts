import {Request} from 'express';
import {User} from '../types/user.entity';
import {AuthUtils} from './auth.utils';
import {AuthService} from '../services/auth.service';

export class RequestUtils {
	
	static async getAuthenticatedUser(req: Request): Promise<User | null> {
		const token = AuthUtils.extractBearerToken(req);
		if (!token) return null;
		return await AuthService.getUserFromAccessToken(token);
	}
}
