import {Request, Response} from 'express';
import {verifyAccessToken} from '../utils/token.utils';

import {error, success} from '../utils/response.utils';
import {extractBearerToken, buildUserResponse} from '../utils/auth.utils';
import {findAndUpdateUser, findUserById} from '../services/user.service';

export default class UserController {
	
	async me(
		req: Request,
		res: Response
	): Promise<Response> {
		console.log('[ME]');
		const token = extractBearerToken(req);
		
		if (!token) return error(res,
			{error: 'Authorization header missing or malformed'},
			401
		);
		
		try {
			const payload = verifyAccessToken(token);
			if (!payload?.sub) return error(res,
				{error: 'Invalid or expired access token'},
				401
			);
			const user = await findUserById(payload.sub);
			if (!user) return error(res,
				{error: 'User not found'},
				404
			);
			return success(res,
				{
					user: buildUserResponse(user)
				}
			);
		} catch (err: any) {
			return error(res,
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
		const token = extractBearerToken(req);
		if (!token) return error(res,
			{error: 'Authorization header missing or malformed'},
			401
		);
		
		try {
			const payload = verifyAccessToken(token);
			if (!payload?.sub) return error(res,
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
				return error(res,
					{error: 'No valid update fields provided'},
					400
				);
			}
			
			const user = await findAndUpdateUser(payload.sub,
				data
			);
			if (!user) return error(res,
				{error: 'User not found'},
				404
			);
			
			return success(res,
				{user: buildUserResponse(user)}
			);
		} catch (err: any) {
			return error(res,
				{error: err.message},
				401
			);
		}
	}
}
