import {Response} from 'express';
import {ObjectId} from 'mongodb';

import {ResponseUtils} from '../../../shared/utils/response.utils';
import {SessionService} from '../services/session.service';

import {
	AccessEncAuthRequest
} from '../../../shared/middlewares/verify-access-token-enc.middleware';

import {
	RefreshEncAuthRequest
} from '../../../shared/middlewares/verify-refresh-token-enc.middleware';

import {
	SessionResponseDto
} from '../dtos/session.dto';
import {ErrorResponse} from '../../../shared/dtos/error.dto';
import {logger} from '../../../shared/utils/logger.utils';

const CONTROLLER = '[SessionController]';

const sessionService = SessionService.getInstance();
const responseUtils = ResponseUtils.getInstance();

export default class SessionController {
	async session(
		req: AccessEncAuthRequest,
		res: Response<{ valid: boolean } | ErrorResponse>
	): Promise<Response> {
		const {
			sessionId,
			visitorId
		} = req.auth!;
		if (sessionId && visitorId) {
			logger.debug(`${CONTROLLER} Session valid: ${sessionId}`);
			return responseUtils.success(res,
				{valid: true}
			);
		}
		logger.warn(`${CONTROLLER} No valid session found`);
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
			logger.debug(`${CONTROLLER} Retrieved ${sessions.length} sessions for user ${userId}`);
			return responseUtils.success(res,
				sessions
			);
		} catch (err: any) {
			logger.error(`${CONTROLLER} Failed to get all sessions:`,
				err
			);
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
			logger.info(`${CONTROLLER} Rotated access token for user ${userId} (session ${sessionId})`);
			return responseUtils.success(res,
				result
			);
		} catch (err: any) {
			logger.warn(`${CONTROLLER} Failed to rotate access token for session ${sessionId}:`,
				err
			);
			return responseUtils.error(res,
				{
					error: err.message ?? 'Failed to refresh session'
				},
				401
			);
		}
	}
	
	async logout(
		req: RefreshEncAuthRequest,
		res: Response<{ success: boolean } | ErrorResponse>
	): Promise<Response> {
		const {
			userId,
			sessionId,
			visitorId
		} = req.auth!;
		try {
			await sessionService.logoutCurrentSessionByValues({
				userId: new ObjectId(userId),
				sessionId,
				visitorId
			});
			logger.info(`${CONTROLLER} Logged out session ${sessionId} for user ${userId}`);
			return responseUtils.success(res,
				{success: true}
			);
		} catch (err: any) {
			logger.error(`${CONTROLLER} Logout failed for user ${userId}, session ${sessionId}:`,
				err
			);
			return responseUtils.error(res,
				{
					error: err.message ?? 'Unexpected error during logout'
				},
				500
			);
		}
	}
}
