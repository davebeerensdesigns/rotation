import {Request, Response} from 'express';

import {ResponseUtils} from '../utils/response.utils';
import {UserService} from '../services/user.service';
import {userUpdateSchema} from '../validators/user.schema';
import {UserMapper} from '../mappers/user.mapper';
import {RequestUtils} from '../utils/request.utils';

const userService = UserService.getInstance();

export default class UserController {
	async me(
		req: Request,
		res: Response
	): Promise<Response> {
		
		try {
			const user = await RequestUtils.getAuthenticatedUser(req);
			if (!user) return ResponseUtils.error(res,
				{error: 'Unauthorized'},
				401
			);
			
			return ResponseUtils.success(res,
				{
					user: UserMapper.toResponse(user)
				}
			);
		} catch (err: any) {
			return ResponseUtils.error(res,
				{
					error: err.message
				},
				500
			);
		}
	}
	
	async update(
		req: Request,
		res: Response
	): Promise<Response> {
		
		try {
			const user = await RequestUtils.getAuthenticatedUser(req);
			if (!user) return ResponseUtils.error(res,
				{error: 'Unauthorized'},
				401
			);
			
			const parsed = userUpdateSchema.safeParse(req.body);
			if (!parsed.success) {
				return ResponseUtils.error(res,
					{
						error: 'Validation failed',
						details: parsed.error.format()
					},
					400
				);
			}
			
			const updateData = parsed.data;
			
			const updated = await userService.findAndUpdateUser(user._id!,
				updateData
			);
			if (!updated) {
				return ResponseUtils.error(res,
					{
						error: 'User not found after update'
					},
					404
				);
			}
			
			return ResponseUtils.success(res,
				{
					user: UserMapper.toResponse(updated)
				}
			);
			
		} catch (err: any) {
			return ResponseUtils.error(res,
				{error: err.message},
				500
			);
		}
	}
}
