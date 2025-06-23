import {Request, Response} from 'express';

import {AuthUtils} from '../utils/auth.utils';
import {ResponseUtils} from '../utils/response.utils';
import {AuthService} from '../services/auth.service';
import {UserService} from '../services/user.service';

const userService = UserService.getInstance();

export default class UserController {
	async me(
		req: Request,
		res: Response
	): Promise<Response> {
		console.log('[ME]');
		const token = AuthUtils.extractBearerToken(req);
		if (!token) {
			return ResponseUtils.error(res,
				{error: 'Authorization header missing or malformed'},
				401
			);
		}
		
		try {
			const user = await AuthService.getUserFromAccessToken(token);
			
			if (!user) {
				return ResponseUtils.error(res,
					{error: 'User not found'},
					401
				);
			}
			
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
	
	async update(
		req: Request,
		res: Response
	): Promise<Response> {
		console.log('[UPDATE]');
		const token = AuthUtils.extractBearerToken(req);
		if (!token) {
			return ResponseUtils.error(res,
				{error: 'Authorization header missing or malformed'},
				401
			);
		}
		
		try {
			const user = await AuthService.getUserFromAccessToken(token);
			
			const {
				email,
				name
			} = req.body;
			const data: Partial<typeof user> = {};
			if (email) data.email = email;
			if (name) data.name = name;
			
			if (!user || Object.keys(data).length === 0) {
				return ResponseUtils.error(res,
					{error: 'No valid update fields provided'},
					400
				);
			}
			
			const updated = await userService.findAndUpdateUser(user._id!,
				data
			);
			if (!updated) return ResponseUtils.error(res,
				{error: 'User not found'},
				404
			);
			
			return ResponseUtils.success(res,
				{
					user: AuthUtils.buildUserResponse(updated)
				}
			);
		} catch (err: any) {
			return ResponseUtils.error(res,
				{error: err.message},
				401
			);
		}
	}
}
