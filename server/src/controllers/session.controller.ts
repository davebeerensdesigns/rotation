import {Request, Response} from 'express';
import {generateNonce} from 'siwe';

import {SessionUtils} from '../utils/session.utils';
import {ResponseUtils} from '../utils/response.utils';
import {SessionService} from '../services/session.service';
import {UserMapper} from '../mappers/user.mapper';
import {ObjectId} from 'mongodb';
import {SessionMapper} from '../mappers/session.mapper';
import {AccessEncAuthRequest} from '../middlewares/verify-access-token-enc.middleware';
import {RefreshEncAuthRequest} from '../middlewares/verify-refresh-token-enc.middleware';
import {JWTPayload} from 'jose';
import {getClientIp} from '../utils/ip.utils';

const sessionUtils = SessionUtils.getInstance();
const sessionService = SessionService.getInstance();
const responseUtils = ResponseUtils.getInstance();

export default class SessionController {
	async nonce(
		req: Request,
		res: Response
	): Promise<void> {
		const nonce = generateNonce();
		res.setHeader('Content-Type',
			'text/plain'
		);
		res.send(nonce);
	}
	
	async verify(
		req: Request,
		res: Response
	): Promise<Response> {
		try {
			const {
				message,
				signature,
				userAgent,
				visitorId,
				ipAddress
			} = req.body;
			
			const givenIpaddress = ipAddress && typeof ipAddress === 'string'
				? ipAddress
				: getClientIp(req);
			
			if (!message || !signature || !userAgent || !visitorId) {
				return responseUtils.error(res,
					{
						error: 'Missing required fields'
					},
					400
				);
			}
			
			const result = await sessionService.loginAndCreateSession({
				message,
				signature,
				userAgent,
				visitorId,
				ipAddress: givenIpaddress
			});
			
			return responseUtils.success(res,
				{
					accessToken: result.accessToken,
					refreshToken: result.refreshToken,
					accessTokenExpires: result.accessTokenExpires,
					refreshTokenExpires: result.refreshTokenExpires,
					chainId: result.chainId,
					address: result.address,
					user: UserMapper.toResponse(result.user)
				}
			);
		} catch (err: any) {
			return responseUtils.error(res,
				{error: err.message},
				500
			);
		}
	}
	
	async session(
		req: AccessEncAuthRequest,
		res: Response
	): Promise<Response> {
		const sessionId = req.auth!.sessionId;
		const visitorId = req.auth!.visitorId;
		if (sessionId && visitorId) {
			return responseUtils.success(res,
				{valid: true}
			);
		}
		return responseUtils.error(res,
			{error: 'No session found'},
			401
		);
	}
	
	async sessionAll(
		req: AccessEncAuthRequest,
		res: Response
	): Promise<Response> {
		const {
			userId,
			sessionId,
			visitorId
		} = req.auth!;
		
		try {
			const sessions = await sessionService.getAllSessionsMapped({
				userId: new ObjectId(userId),
				currentSessionId: sessionId,
				currentVisitorId: visitorId
			});
			
			return responseUtils.success(res,
				sessions
			);
		} catch (err: any) {
			return responseUtils.error(res,
				{error: 'Unexpected error retrieving sessions'},
				500
			);
		}
	}
	
	async refresh(
		req: RefreshEncAuthRequest,
		res: Response
	): Promise<Response> {
		const {
			userId,
			visitorId,
			sessionId,
			address,
			chainId,
			role
		} = req.auth!;
		
		try {
			const result = await sessionService.rotateAccessToken({
				userId: new ObjectId(userId),
				visitorId,
				sessionId,
				chainId,
				address,
				role
			});
			
			return responseUtils.success(res,
				result
			);
		} catch (err: any) {
			return responseUtils.error(res,
				{error: err.message},
				401
			);
		}
	}
	
	async logout(
		req: AccessEncAuthRequest,
		res: Response
	): Promise<Response> {
		const userId = new ObjectId(req.auth!.userId);
		const sessionId = req.auth!.sessionId;
		const visitorId = req.auth!.visitorId;
		
		try {
			await sessionService.logoutUserCurrentSessionByValues({
				userId,
				sessionId,
				visitorId
			});
			
			return responseUtils.success(res,
				{success: true}
			);
		} catch (err: any) {
			return responseUtils.error(res,
				{error: err.message},
				500
			);
		}
	}
}
