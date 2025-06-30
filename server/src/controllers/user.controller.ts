import {Response} from 'express';

import {ResponseUtils} from '../utils/response.utils';
import {UserService} from '../services/user.service';
import {UserMapper} from '../mappers/user.mapper';
import {userUpdateSchema} from '../schemas/user.schema';
import {AccessEncAuthRequest} from '../middlewares/verify-access-token-enc.middleware';
import {ObjectId} from 'mongodb';
import {AccessAuthRequest} from '../middlewares/verify-access-token.middleware';

const userService = UserService.getInstance();
const responseUtils = ResponseUtils.getInstance();

export default class UserController {
	async me(
		req: AccessAuthRequest,
		res: Response
	): Promise<Response> {
		
		const userId = new ObjectId(req.auth!.userId);
		const chainId = req.auth!.chainId;
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
				chainId,
				user: UserMapper.toResponse(user)
			}
		);
	}
	
	async update(
		req: AccessEncAuthRequest,
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
		
		const updatedUser = await userService.findAndUpdateUser({
			userId,
			data: updateData
		});
		
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
