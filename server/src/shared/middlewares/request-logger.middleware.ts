import {Request, Response, NextFunction} from 'express';
import {logger} from '../utils/logger.utils';
import {logDevOnly} from '../utils/logger.utils';

export function requestLoggerMiddleware() {
	return (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		const {
			method,
			originalUrl
		} = req;
		const start = Date.now();
		
		res.on('finish',
			() => {
				const duration = Date.now() - start;
				logger.info(`[Request] ${method} ${originalUrl} - ${res.statusCode} (${duration}ms)`);
				logDevOnly(`[RequestBody] ${JSON.stringify(req.body)}`);
			}
		);
		
		next();
	};
}
