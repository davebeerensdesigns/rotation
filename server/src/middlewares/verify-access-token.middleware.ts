import {Request, Response, NextFunction} from 'express';
import {SessionUtils} from '../utils/session.utils';
import {ResponseUtils} from '../utils/response.utils';
import {AccessTokenPayload} from '../types/auth.types';
import {logger, logDevOnly} from '../utils/logger.utils';

const sessionUtils = SessionUtils.getInstance();
const responseUtils = ResponseUtils.getInstance();

const MIDDLEWARE = '[verifyAccessTokenMiddleware]';

export interface AccessAuthRequest extends Request {
	auth?: AccessTokenPayload;
}

export function verifyAccessTokenMiddleware() {
	return async (
		req: AccessAuthRequest,
		res: Response,
		next: NextFunction
	) => {
		try {
			const accessToken = sessionUtils.extractBearerToken(req);
			if (!accessToken) {
				logger.warn(`${MIDDLEWARE} Missing or malformed Authorization header`);
				return responseUtils.error(res,
					{error: 'Missing or malformed Authorization header'},
					401
				);
			}
			
			const verified = await sessionUtils.verifyAccessToken(accessToken);
			if (!verified?.sub || !verified.address || !verified.role || !verified.chainId) {
				logger.warn(`${MIDDLEWARE} Invalid access token payload`);
				logDevOnly(`${MIDDLEWARE} Payload: ${JSON.stringify(verified)}`);
				return responseUtils.error(res,
					{error: 'Invalid access token payload'},
					401
				);
			}
			
			req.auth = {
				userId: verified.sub,
				role: verified.role,
				chainId: verified.chainId,
				address: verified.address,
				accessToken
			};
			
			logDevOnly(`${MIDDLEWARE} Verified user ${verified.sub}`);
			return next();
		} catch (err: any) {
			logger.error(`${MIDDLEWARE} Failed to verify access token:`,
				err
			);
			return responseUtils.error(res,
				{error: 'Invalid or expired access token'},
				401
			);
		}
	};
}
