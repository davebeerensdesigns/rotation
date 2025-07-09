import {Request, Response, NextFunction} from 'express';
import {SessionUtils} from '../utils/session.utils';
import {ResponseUtils} from '../utils/response.utils';
import {AccessTokenPayload} from '../types/auth.types';

const sessionUtils = SessionUtils.getInstance();
const responseUtils = ResponseUtils.getInstance();

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
				return responseUtils.error(res,
					{error: 'Missing or malformed Authorization header'},
					401
				);
			}
			
			const verified = await sessionUtils.verifyAccessToken(accessToken);
			if (!verified?.sub || !verified.address || !verified.role || !verified.chainId) {
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
			
			return next();
		} catch {
			return responseUtils.error(res,
				{error: 'Invalid or expired access token'},
				401
			);
		}
	};
}
