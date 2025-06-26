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
			// Take data from body
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
			
			// Verify message and signature
			const {
				address,
				chainId
			} = await sessionService.verifySiweSignature(
				message,
				signature
			);
			
			// Parse address and chainId
			const parsed = userCreateSchema.safeParse({
				address,
				chainId
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
			
			// Find or create the user
			const user = await userService.findOrCreateUser(
				address,
				chainId
			);
			
			// Create a random sessionId
			const sessionId = new ObjectId().toString();
			
			// Generate accessToken and refreshToken
			const {
				accessToken,
				refreshToken
			} = sessionUtils.generateTokens(
				user._id.toString(),
				user.role,
				sessionId,
				visitorId
			);
			
			// Decode accessToken to get token exp
			const decodedAccess = sessionUtils.decodeToken(accessToken);
			const accessTokenExpires = decodedAccess?.exp;
			
			// Store the session in database
			await sessionService.storeSession(
				user._id,
				refreshToken,
				userAgent,
				visitorId,
				sessionId
			);
			
			return responseUtils.success(res,
				{
					accessToken,
					refreshToken,
					accessTokenExpires,
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
		req: Request,
		res: Response
	): Promise<Response> {
		try {
			// Take accessToken from bearer header
			const accessToken = sessionUtils.extractBearerToken(req);
			if (!accessToken) {
				return responseUtils.error(res,
					{error: 'Missing access token'},
					401
				);
			}
			
			// Find the exact user session by userId, sessionId and visitorId
			const session = await sessionService.findExactSession(accessToken);
			
			if (!session) {
				return responseUtils.error(res,
					{error: 'SessionEntity not found or revoked'},
					401
				);
			}
			
			return responseUtils.success(res,
				{valid: true}
			);
		} catch (err: any) {
			return responseUtils.error(res,
				{error: err.message},
				500
			);
		}
	}
	
	async refresh(
		req: Request,
		res: Response
	): Promise<Response> {
		// Take refreshToken from bearer header
		const refreshToken = sessionUtils.extractBearerToken(req);
		if (!refreshToken) {
			return responseUtils.error(res,
				{
					error: 'Missing refreshToken'
				},
				400
			);
		}
		
		try {
			// Verify refreshToken and generate new accessToken
			const {
				accessToken,
				accessTokenExpires
			} = await sessionService.refreshAccessToken(refreshToken);
			
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
		// Take accessToken from bearer header
		const accessToken = sessionUtils.extractBearerToken(req);
		if (!accessToken) {
			return responseUtils.error(res,
				{
					error: 'Authorization header missing or malformed'
				},
				401
			);
		}
		
		try {
			// Logout user current session
			await sessionService.logoutUserCurrentSession(accessToken);
			return responseUtils.success(res,
				{success: true}
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
	
	async sessionAll(
		req: Request,
		res: Response
	): Promise<Response> {
		const accessToken = sessionUtils.extractBearerToken(req);
		if (!accessToken) {
			return responseUtils.error(res,
				{error: 'Authorization header missing or malformed'},
				401
			);
		}
		
		try {
			const sessions = await sessionService.getAllUserSessionsFromAccessTokenSub(accessToken);
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
			console.error('[SESSION] Failed to load sessions:',
				err
			);
			return responseUtils.error(res,
				{error: 'Unexpected error retrieving sessions'},
				500
			);
		}
	}
}
