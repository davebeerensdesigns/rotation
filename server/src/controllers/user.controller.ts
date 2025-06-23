import {Request, Response} from 'express';

import {JwtUtils} from '../utils/jwt.utils';
import {UserService} from '../services/user.service';
import {ResponseUtils} from '../utils/response.utils';
import {AuthUtils} from '../utils/auth.utils';
// Singleton instance
const jwtService = JwtUtils.getInstance();
const userService = UserService.getInstance();

export default class UserController {
	
	async me(
		req: Request,
		res: Response
	): Promise<Response> {
		console.log('[ME]');
		const token = AuthUtils.extractBearerToken(req);
		
		if (!token) return ResponseUtils.error(res,
			{error: 'Authorization header missing or malformed'},
			401
		);
		
		try {
			const payload = jwtService.verifyAccessToken(token);
			if (!payload?.sub) return ResponseUtils.error(res,
				{error: 'Invalid or expired access token'},
				401
			);
			const user = await userService.findUserById(payload.sub);
			if (!user) return ResponseUtils.error(res,
				{error: 'User not found'},
				404
			);
			return ResponseUtils.success(res,
				{
					user: AuthUtils.buildUserResponse(user)
				}
			);
		} catch (err: any) {
			return ResponseUtils.error(res,
				{error: err.message},
				401
			);
		}
	}
	
	/**
	 * Validates the access token from the Authorization header and returns associated user info.
	 *
	 * @param {Request} req - The Express request object with a bearer access token in the Authorization header.
	 * @param {Response} res - The Express response object used to send back the session user data or error.
	 * @returns {Promise<Response>} A Promise resolving to a response with user info or error.
	 */
	async update(
		req: Request,
		res: Response
	): Promise<Response> {
		console.log('[UPDATE]');
		// TODO: validate data
		const token = AuthUtils.extractBearerToken(req);
		if (!token) return ResponseUtils.error(res,
			{error: 'Authorization header missing or malformed'},
			401
		);
		
		try {
			const payload = jwtService.verifyAccessToken(token);
			if (!payload?.sub) return ResponseUtils.error(res,
				{error: 'Invalid or expired access token'},
				401
			);
			
			const {
				email,
				name
			} = req.body;
			
			// Bouw dynamisch de update-object
			const data: Record<string, any> = {};
			if (email) data.email = email;
			if (name) data.name = name;
			
			if (Object.keys(data).length === 0) {
				return ResponseUtils.error(res,
					{error: 'No valid update fields provided'},
					400
				);
			}
			
			const user = await userService.findAndUpdateUser(payload.sub,
				data
			);
			if (!user) return ResponseUtils.error(res,
				{error: 'User not found'},
				404
			);
			
			return ResponseUtils.success(res,
				{user: AuthUtils.buildUserResponse(user)}
			);
		} catch (err: any) {
			return ResponseUtils.error(res,
				{error: err.message},
				401
			);
		}
	}
}
