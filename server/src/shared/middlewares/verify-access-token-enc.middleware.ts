import {Request, Response, NextFunction} from 'express';
import {SessionUtils} from '../../modules/session/utils/session.utils';
import {SessionService} from '../../modules/session/services/session.service';
import {ResponseUtils} from '../utils/response.utils';
import {ObjectId} from 'mongodb';
import {AccessEncTokenPayload} from '../types/auth.types';
import {logger, logDevOnly} from '../utils/logger.utils';
import {AuthUtils} from '../utils/auth.utils';

const sessionUtils = SessionUtils.getInstance();
const sessionService = SessionService.getInstance();
const authUtils = AuthUtils.getInstance();
const responseUtils = ResponseUtils.getInstance();

const MIDDLEWARE = '[verifyAccessTokenEncMiddleware]';

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
			const accessToken = authUtils.extractBearerToken(req);
			if (!accessToken) {
				logger.warn(`${MIDDLEWARE} Missing Authorization header`);
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
			
			if (!session) {
				logger.warn(`${MIDDLEWARE} No session found for user ${verified.sub}`);
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
			
			logDevOnly(`${MIDDLEWARE} Verified encrypted access for user ${verified.sub}, session ${verified.sessionId}`);
			return next();
		} catch (err: any) {
			logger.error(`${MIDDLEWARE} Failed to verify encrypted access token:`,
				err
			);
			return responseUtils.error(res,
				{error: 'Invalid or expired access token'},
				401
			);
		}
	};
}
