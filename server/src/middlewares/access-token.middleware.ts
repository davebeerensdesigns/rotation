import {Request, Response, NextFunction} from 'express';
import {SessionUtils} from '../utils/session.utils';
import {SessionService} from '../services/session.service';
import {ResponseUtils} from '../utils/response.utils';

const sessionUtils = SessionUtils.getInstance();
const sessionService = SessionService.getInstance();
const responseUtils = ResponseUtils.getInstance();

export interface AuthPayload {
	userId: string;
	sessionId: string;
	visitorId: string;
	role: string;
	accessToken: string;
}

export interface AuthRequest extends Request {
	auth?: AuthPayload;
}

/**
 * Middleware to validate access token and optionally check session in DB.
 * @param checkSessionInDb Whether to validate the session against the DB
 */
export function accessTokenMiddleware(checkSessionInDb = false) {
	return async (
		req: AuthRequest,
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
			
			const payload = sessionUtils.verifyAccessToken(accessToken);
			if (
				!payload?.sub ||
				!payload.sessionId ||
				!payload.visitorId
			) {
				return responseUtils.error(res,
					{error: 'Invalid access token payload'},
					401
				);
			}
			
			const userId = payload.sub;
			const sessionId = payload.sessionId;
			const visitorId = payload.visitorId;
			const role = payload.role;
			
			if (checkSessionInDb) {
				const session = await sessionService.findExactSession(accessToken);
				if (!session) {
					return responseUtils.error(res,
						{error: 'Session not found or revoked'},
						401
					);
				}
			}
			
			// Attach to req for use in controller
			req.auth = {
				userId,
				sessionId,
				visitorId,
				role,
				accessToken
			};
			
			next();
		} catch (err: any) {
			return responseUtils.error(res,
				{error: 'Invalid or expired access token'},
				401
			);
		}
	};
}
