import {Request, Response} from 'express';
import {generateNonce} from 'siwe';

import {SessionUtils} from '../utils/session.utils';
import {UserService} from '../services/user.service';
import {ResponseUtils} from '../utils/response.utils';
import {SessionService} from '../services/session.service';

import {UserMapper} from '../mappers/user.mapper';
import {ObjectId} from 'mongodb';
import {userCreateSchema} from '../schemas/user.schema';
import {SessionMapper} from '../mappers/session.mapper';
import {AccessEncAuthRequest} from '../middlewares/verify-access-token-enc.middleware';
import {RefreshEncAuthRequest} from '../middlewares/verify-refresh-token-enc.middleware';
import {JWTPayload} from 'jose';

const sessionUtils = SessionUtils.getInstance();
const userService = UserService.getInstance();
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
				visitorId
			} = req.body;
			
			if (!message || !signature) {
				return responseUtils.error(res,
					{
						error: 'SiweMessage is undefined or incomplete'
					},
					400
				);
			}
			if (!userAgent || !visitorId) {
				return responseUtils.error(res,
					{
						error: 'Missing userAgent or visitorId'
					},
					400
				);
			}
			
			const {
				address,
				chainId
			} = await sessionService.verifySiweSignature({
				message,
				signature
			});
			
			const parsed = userCreateSchema.safeParse({
				address
			});
			
			if (!parsed.success) {
				return responseUtils.error(res,
					{
						error: 'Invalid user data',
						details: parsed.error.flatten()
					},
					400
				);
			}
			
			const user = await userService.findOrCreateUser(
				address
			);
			
			const sessionId = new ObjectId().toString();
			
			const {
				accessToken,
				refreshToken
			} = await sessionUtils.generateTokens({
				userId: user._id.toString(),
				role: user.role,
				sessionId,
				visitorId,
				chainId,
				address
			});
			
			const decodedAccess = sessionUtils.decodeToken(accessToken);
			const accessTokenExpires = decodedAccess?.exp;
			
			const decodedRefresh = sessionUtils.decodeToken(refreshToken);
			const refreshTokenExpires = decodedRefresh?.exp;
			
			await sessionService.storeSession({
				userId: user._id,
				refreshToken,
				chainId,
				userAgent,
				visitorId,
				sessionId,
				address
			});
			
			return responseUtils.success(res,
				{
					accessToken,
					accessTokenExpires,
					refreshToken,
					refreshTokenExpires,
					chainId,
					address,
					user: UserMapper.toResponse(user)
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
		const userId = req.auth!.userId;
		
		try {
			const sessions = await sessionService.getAllUserSessionsByUserId(new ObjectId(userId));
			if (sessions === null) {
				return responseUtils.error(res,
					{error: 'Invalid or expired access token'},
					401
				);
			}
			
			return responseUtils.success(res,
				SessionMapper.toResponseArray(sessions)
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
		
		const userId = req.auth!.userId;
		const visitorId = req.auth!.visitorId;
		const sessionId = req.auth!.sessionId;
		const address = req.auth!.address;
		const chainId = req.auth!.chainId;
		const role = req.auth!.role;
		
		try {
			const {
				accessToken,
				accessTokenExpires
			} = await sessionService.refreshAccessToken({
				userId: new ObjectId(userId),
				visitorId,
				sessionId,
				chainId,
				address,
				role
			});
			
			return responseUtils.success(res,
				{
					accessToken,
					accessTokenExpires
				}
			);
		} catch (err: any) {
			return responseUtils.error(res,
				{
					error: err.message
				},
				401
			);
		}
	}
	
	async logout(
		req: Request,
		res: Response
	): Promise<Response> {
		const accessToken = sessionUtils.extractBearerToken(req);
		if (!accessToken) {
			return responseUtils.error(res,
				{error: 'Missing or malformed Authorization header'},
				401
			);
		}
		const payload = sessionUtils.decodeToken(accessToken);
		const decodedPayload = payload as unknown as JWTPayload;
		const enc = await sessionUtils.decryptNestedPayload(decodedPayload);
		
		const userId = new ObjectId(payload?.sub);
		const sessionId = enc.sessionId;
		const visitorId = enc.visitorId;
		
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
				{
					error: err.message
				},
				500
			);
		}
	}
}
