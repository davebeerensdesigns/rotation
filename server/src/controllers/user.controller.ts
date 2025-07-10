import {Response} from 'express';
import {ObjectId} from 'mongodb';

import {ResponseUtils} from '../utils/response.utils';
import {UserService} from '../services/user.service';
import {UserMapper} from '../mappers/user.mapper';
import {AccessAuthRequest} from '../middlewares/verify-access-token.middleware';
import {AccessEncAuthRequest} from '../middlewares/verify-access-token-enc.middleware';
import {UserResponseDto} from '../dtos/user.dto';
import {ValidationError} from '../errors/validation-error';
import {ErrorResponse} from '../dtos/error.dto';
import {logger} from '../utils/logger.utils';

const CONTROLLER = '[UserController]';

const userService = UserService.getInstance();
const responseUtils = ResponseUtils.getInstance();

export default class UserController {
	async me(
		req: AccessAuthRequest,
		res: Response<{ chainId: string; user: UserResponseDto } | ErrorResponse>
	): Promise<Response> {
		const userId = new ObjectId(req.auth!.userId);
		const chainId = req.auth!.chainId;
		
		try {
			const user = await userService.getUserByUserId(userId);
			
			if (!user) {
				logger.warn(`${CONTROLLER} No user found for userId ${userId}`);
				return responseUtils.error(res,
					{error: 'No user found'},
					401
				);
			}
			
			logger.debug(`${CONTROLLER} Retrieved user ${userId}`);
			return responseUtils.success(res,
				{
					chainId,
					user: UserMapper.toResponse(user)
				}
			);
		} catch (err: any) {
			logger.error(`${CONTROLLER} Failed to retrieve user ${userId}:`,
				err
			);
			return responseUtils.error(res,
				{error: 'Unexpected error fetching user'},
				500
			);
		}
	}
	
	async update(
		req: AccessEncAuthRequest,
		res: Response<{ user: UserResponseDto } | ErrorResponse>
	): Promise<Response> {
		const userId = new ObjectId(req.auth!.userId);
		
		try {
			const updatedUser = await userService.findAndUpdateUser({
				userId,
				data: req.body
			});
			
			if (!updatedUser) {
				logger.warn(`${CONTROLLER} User update failed for userId ${userId}`);
				return responseUtils.error(res,
					{error: 'User not found or update failed'},
					404
				);
			}
			
			logger.info(`${CONTROLLER} Updated user ${userId}`);
			return responseUtils.success(res,
				{
					user: UserMapper.toResponse(updatedUser)
				}
			);
		} catch (err: any) {
			if (err instanceof ValidationError) {
				logger.warn(`${CONTROLLER} Validation error for user ${userId}:`,
					err.details
				);
				return responseUtils.error(res,
					{
						error: err.message,
						details: err.details
					},
					400
				);
			}
			
			logger.error(`${CONTROLLER} Unexpected error updating user ${userId}:`,
				err
			);
			return responseUtils.error(res,
				{error: 'Unexpected error updating user'},
				500
			);
		}
	}
}
