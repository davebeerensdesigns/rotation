import {Request, Response, NextFunction} from 'express';
import {SessionUtils} from '../utils/session.utils';
import {SessionService} from '../services/session.service';
import {ResponseUtils} from '../utils/response.utils';
import {ObjectId} from 'mongodb';
import {AccessEncTokenPayload} from '../types/auth.types';

const sessionUtils = SessionUtils.getInstance();
const sessionService = SessionService.getInstance();
const responseUtils = ResponseUtils.getInstance();

export interface AccessEncAuthRequest extends Request {
	auth?: AccessEncTokenPayload;
}

export function verifyAccessTokenEncMiddleware() {
	return async (
		req: AccessEncAuthRequest,
		res: Response,
		next: NextFunction
	) => {
		try {
			const accessToken = sessionUtils.extractBearerToken(req);
			if (!accessToken) {
				return responseUtils.error(res,
					{error: 'Missing or malformed Authorization header'},
					401
				);
			}
			
			const verified = await sessionUtils.verifyAccessTokenAndDecryptEnc(accessToken);
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
			
			if (!session) {
				return responseUtils.error(res,
					{error: 'No session found'},
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
				accessToken
			};
			
			return next();
		} catch {
			return responseUtils.error(res,
				{error: 'Invalid or expired access token'},
				401
			);
		}
	};
}
