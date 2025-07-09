import {Request, Response} from 'express';
import {ObjectId} from 'mongodb';

import {ResponseUtils} from '../utils/response.utils';
import {SessionService} from '../services/session.service';
import {NonceService} from '../services/nonce.service';
import {UserMapper} from '../mappers/user.mapper';
import {getClientIp} from '../utils/ip.utils';

import {
	AccessEncAuthRequest
} from '../middlewares/verify-access-token-enc.middleware';

import {
	RefreshEncAuthRequest
} from '../middlewares/verify-refresh-token-enc.middleware';

import {
	MessageParamsDto,
	NonceRequestDto, SessionLoginResponseDto,
	SessionResponseDto,
	VerifyRequestDto
} from '../dtos/session.dto';
import {UserResponseDto} from '../dtos/user.dto';
import {ErrorResponse} from '../dtos/error.dto';
import {ValidationError} from '../errors/validation-error';

const sessionService = SessionService.getInstance();
const nonceService = NonceService.getInstance();
const responseUtils = ResponseUtils.getInstance();

export default class SessionController {
	async nonce(
		req: Request<{}, {}, NonceRequestDto>,
		res: Response<{ nonce: string } | ErrorResponse>
	): Promise<Response> {
		try {
			const nonce = await nonceService.generateAndSaveNonce(req.body.visitorId);
			return responseUtils.success(res,
				{nonce}
			);
		} catch (err: any) {
			return responseUtils.error(res,
				{
					error: err.message ?? 'Unexpected error generating nonce'
				},
				500
			);
		}
	}
	
	async messageParams(
		req: Request,
		res: Response<MessageParamsDto | ErrorResponse>
	): Promise<Response> {
		try {
			const data = await sessionService.getMessageParams();
			return responseUtils.success(res,
				data
			);
		} catch {
			return responseUtils.error(res,
				{
					error: 'Failed to retrieve message params'
				},
				500
			);
		}
	}
	
	async verify(
		req: Request<{}, {}, VerifyRequestDto>,
		res: Response<SessionLoginResponseDto | ErrorResponse>
	): Promise<Response> {
		const ipAddress = req.body.ipAddress || getClientIp(req);
		
		try {
			const result = await sessionService.loginAndCreateSession({
				...req.body,
				ipAddress
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
					error: err.message ?? 'Unexpected error verifying session',
					details: err.details ?? undefined
				},
				500
			);
		}
	}
	
	async session(
		req: AccessEncAuthRequest,
		res: Response<{ valid: boolean } | ErrorResponse>
	): Promise<Response> {
		const {
			sessionId,
			visitorId
		} = req.auth!;
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
		res: Response<SessionResponseDto[] | ErrorResponse>
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
		} catch {
			return responseUtils.error(res,
				{
					error: 'Unexpected error retrieving sessions'
				},
				500
			);
		}
	}
	
	async refresh(
		req: RefreshEncAuthRequest,
		res: Response<{
			accessToken: string;
			accessTokenExpires: number;
		} | ErrorResponse>
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
				address,
				chainId,
				role
			});
			return responseUtils.success(res,
				result
			);
		} catch (err: any) {
			return responseUtils.error(res,
				{
					error: err.message ?? 'Failed to refresh session'
				},
				401
			);
		}
	}
	
	async logout(
		req: AccessEncAuthRequest,
		res: Response<{ success: boolean } | ErrorResponse>
	): Promise<Response> {
		const {
			userId,
			sessionId,
			visitorId
		} = req.auth!;
		try {
			await sessionService.logoutUserCurrentSessionByValues({
				userId: new ObjectId(userId),
				sessionId,
				visitorId
			});
			return responseUtils.success(res,
				{success: true}
			);
		} catch (err: any) {
			return responseUtils.error(res,
				{
					error: err.message ?? 'Unexpected error during logout'
				},
				500
			);
		}
	}
}
