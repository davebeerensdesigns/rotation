import {Request, Response} from 'express';

import {ResponseUtils} from '../utils/response.utils';
import {UserService} from '../services/user.service';
import {UserMapper} from '../mappers/user.mapper';
import {userUpdateSchema} from '../schemas/user.schema';
import {SessionUtils} from '../utils/session.utils';

const userService = UserService.getInstance();
const sessionUtils = SessionUtils.getInstance();
const responseUtils = ResponseUtils.getInstance();

export default class UserController {
	async me(
		req: Request,
		res: Response
	): Promise<Response> {
		// Take accessToken from bearer header
		const accessToken = sessionUtils.extractBearerToken(req);
		if (!accessToken) {
			return responseUtils.error(res,
				{error: 'Missing access token'},
				401
			);
		}
		
		const user = await userService.getUserFromAccessToken(accessToken);
		
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
		req: Request,
		res: Response
	): Promise<Response> {
		// Take accessToken from bearer header
		const accessToken = sessionUtils.extractBearerToken(req);
		if (!accessToken) {
			return responseUtils.error(res,
				{error: 'Missing access token'},
				401
			);
		}
		
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
		
		const updatedUser = await userService.findAndUpdateUser(accessToken,
			updateData
		);
		
		if (!updatedUser) {
			return responseUtils.error(res,
				{
					error: 'User update failed'
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
