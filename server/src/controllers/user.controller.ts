import {Response} from 'express';
import {ObjectId} from 'mongodb';

import {ResponseUtils} from '../utils/response.utils';
import {UserService} from '../services/user.service';
import {UserMapper} from '../mappers/user.mapper';
import {AccessAuthRequest} from '../middlewares/verify-access-token.middleware';
import {AccessEncAuthRequest} from '../middlewares/verify-access-token-enc.middleware';
import {userUpdateSchema} from '../schemas/user.schema';
import {UserResponseDto, UserUpdateDto} from '../dtos/user.dto';

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
		const parsed = userUpdateSchema.safeParse(req.body);
		
		if (!parsed.success) {
			return responseUtils.error(res,
				{
					error: 'Validation failed',
					details: parsed.error.flatten()
				},
				400
			);
		}
		
		try {
			const updatedUser = await userService.findAndUpdateUser({
				userId,
				data: parsed.data as UserUpdateDto
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
			return responseUtils.error(res,
				{
					error: err.message ?? 'Unexpected error updating user',
					details: err.details ?? undefined
				},
				500
			);
		}
	}
}
