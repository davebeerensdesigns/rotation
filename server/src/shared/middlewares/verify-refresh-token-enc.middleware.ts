import {Request, Response, NextFunction} from 'express';
import {SessionUtils} from '../../modules/session/utils/session.utils';
import {SessionService} from '../../modules/session/services/session.service';
import {ResponseUtils} from '../utils/response.utils';
import {ObjectId} from 'mongodb';
import {RefreshTokenPayload} from '../types/auth.types';
import {logger, logDevOnly} from '../utils/logger.utils';
import {AuthUtils} from '../utils/auth.utils';

const sessionUtils = SessionUtils.getInstance();
const sessionService = SessionService.getInstance();
const authUtils = AuthUtils.getInstance();
const responseUtils = ResponseUtils.getInstance();

const MIDDLEWARE = '[verifyRefreshTokenEncMiddleware]';

export interface RefreshEncAuthRequest extends Request {
	auth?: RefreshTokenPayload;
}

export function verifyRefreshTokenEncMiddleware() {
	return async (
		req: RefreshEncAuthRequest,
		res: Response,
		next: NextFunction
	) => {
		try {
			const refreshToken = authUtils.extractBearerToken(req);
			if (!refreshToken) {
				logger.warn(`${MIDDLEWARE} Missing Authorization header`);
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
				logger.warn(`${MIDDLEWARE} Incomplete token payload`);
				logDevOnly(`${MIDDLEWARE} Payload: ${JSON.stringify(verified)}`);
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
				logger.warn(`${MIDDLEWARE} Refresh token mismatch or revoked for user ${verified.sub}`);
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
			
			logDevOnly(`${MIDDLEWARE} Verified refresh token for user ${verified.sub}, session ${verified.sessionId}`);
			return next();
		} catch (err: any) {
			logger.error(`${MIDDLEWARE} Failed to verify encrypted refresh token:`,
				err
			);
			return responseUtils.error(res,
				{error: 'Invalid or expired access token'},
				401
			);
		}
	};
}
