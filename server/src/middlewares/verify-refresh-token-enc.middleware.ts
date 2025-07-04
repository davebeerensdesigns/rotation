import {Request, Response, NextFunction} from 'express';
import {SessionUtils} from '../utils/session.utils';
import {SessionService} from '../services/session.service';
import {ResponseUtils} from '../utils/response.utils';
import {ObjectId} from 'mongodb';

const sessionUtils = SessionUtils.getInstance();
const sessionService = SessionService.getInstance();
const responseUtils = ResponseUtils.getInstance();

export interface AuthPayload {
	userId: string;
	role: string;
	chainId: string;
	address: string;
	sessionId: string;
	visitorId: string;
	refreshToken: string;
}

export interface RefreshEncAuthRequest extends Request {
	auth?: AuthPayload;
}

export function verifyRefreshTokenEncMiddleware() {
	return async (
		req: RefreshEncAuthRequest,
		res: Response,
		next: NextFunction
	) => {
		try {
			const refreshToken = sessionUtils.extractBearerToken(req);
			if (!refreshToken) {
				return responseUtils.error(res,
					{error: 'Missing or malformed Authorization header'},
					401
				);
			}
			
			const verified = await sessionUtils.verifyRefreshTokenAndDecryptEnc(refreshToken);
			if (
				!verified?.sub ||
				!verified.address ||
				!verified.role ||
				!verified.chainId ||
				!verified.sessionId ||
				!verified.visitorId
			) {
				return responseUtils.error(res,
					{error: 'Invalid access token payload'},
					401
				);
			}
			
			const session = await sessionService.findExactSessionByValues({
				userId: new ObjectId(verified.sub),
				sessionId: verified.sessionId,
				visitorId: verified.visitorId
			});
			
			const hashedInputToken = sessionUtils.hashToken(refreshToken);
			const isValid = !!session && session.refreshToken === hashedInputToken;
			
			if (!isValid) {
				return responseUtils.error(res,
					{error: 'Token mismatch or revoked'},
					401
				);
			}
			
			req.auth = {
				userId: verified.sub,
				role: verified.role,
				chainId: verified.chainId,
				address: verified.address,
				sessionId: verified.sessionId,
				visitorId: verified.visitorId,
				refreshToken
			};
			
			return next();
		} catch (err: any) {
			return responseUtils.error(res,
				{error: 'Invalid or expired access token'},
				401
			);
		}
	};
}
