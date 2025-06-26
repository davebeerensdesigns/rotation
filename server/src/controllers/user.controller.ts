import {Response} from 'express';

import {ResponseUtils} from '../utils/response.utils';
import {UserService} from '../services/user.service';
import {UserMapper} from '../mappers/user.mapper';
import {userUpdateSchema} from '../schemas/user.schema';
import {AuthRequest} from '../middlewares/access-token.middleware';
import {ObjectId} from 'mongodb';

const userService = UserService.getInstance();
const responseUtils = ResponseUtils.getInstance();

export default class UserController {
	async me(
		req: AuthRequest,
		res: Response
	): Promise<Response> {
		
		const userId = new ObjectId(req.auth!.userId);
		const user = await userService.getUserByUserId(userId);
		
		if (!user) {
			return responseUtils.error(res,
				{
					error: 'No user found'
				},
				401
			);
		}
		
		return responseUtils.success(res,
			{
				user: UserMapper.toResponse(user)
			}
		);
	}
	
	async update(
		req: AuthRequest,
		res: Response
	): Promise<Response> {
		
		const userId = new ObjectId(req.auth!.userId);
		
		const parsed = userUpdateSchema.safeParse(req.body);
		if (!parsed.success) {
			return responseUtils.error(res,
				{
					error: 'Validation failed',
					details: parsed.error.format()
				},
				400
			);
		}
		
		const updateData = parsed.data;
		
		const updatedUser = await userService.findAndUpdateUser(userId,
			updateData
		);
		
		if (!updatedUser) {
			return responseUtils.error(res,
				{
					error: 'User not found or update failed'
				},
				404
			);
		}
		
		return responseUtils.success(res,
			{
				user: UserMapper.toResponse(updatedUser)
			}
		);
	}
}
