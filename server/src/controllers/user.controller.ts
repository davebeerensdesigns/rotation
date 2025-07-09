import {Response} from 'express';
import {ObjectId} from 'mongodb';

import {ResponseUtils} from '../utils/response.utils';
import {UserService} from '../services/user.service';
import {UserMapper} from '../mappers/user.mapper';
import {AccessAuthRequest} from '../middlewares/verify-access-token.middleware';
import {AccessEncAuthRequest} from '../middlewares/verify-access-token-enc.middleware';
import {UserResponseDto} from '../dtos/user.dto';
import {ValidationError} from '../errors/validation-error';

const userService = UserService.getInstance();
const responseUtils = ResponseUtils.getInstance();

export default class UserController {
	async me(
		req: AccessAuthRequest,
		res: Response<{ chainId: string; user: UserResponseDto }>
	): Promise<Response> {
		const userId = new ObjectId(req.auth!.userId);
		const chainId = req.auth!.chainId;
		const user = await userService.getUserByUserId(userId);
		
		if (!user) {
			return responseUtils.error(res,
				{error: 'No user found'},
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
		res: Response<{ user: UserResponseDto } | { error: string; details?: unknown }>
	): Promise<Response> {
		const userId = new ObjectId(req.auth!.userId);
		
		try {
			const updatedUser = await userService.findAndUpdateUser({
				userId,
				data: req.body
			});
			
			if (!updatedUser) {
				return responseUtils.error(res,
					{error: 'User not found or update failed'},
					404
				);
			}
			
			return responseUtils.success(res,
				{
					user: UserMapper.toResponse(updatedUser)
				}
			);
		} catch (err: any) {
			if (err instanceof ValidationError) {
				return responseUtils.error(res,
					{
						error: err.message,
						details: err.details
					},
					400
				);
			}
			
			return responseUtils.error(res,
				{
					error: 'Unexpected error updating user'
				},
				500
			);
		}
	}
}
