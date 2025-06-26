import {Response} from 'express';

type SuccessData = Record<string, any>;
type ErrorData = { error: string; code?: number; details?: any };

export class ResponseUtils {
	private static instance: ResponseUtils;
	
	private constructor() {}
	
	public static getInstance(): ResponseUtils {
		if (!ResponseUtils.instance) {
			ResponseUtils.instance = new ResponseUtils();
		}
		return ResponseUtils.instance;
	}
	
	public success(
		res: Response,
		data: SuccessData = {},
		status: number = 200
	): Response {
		return res.status(status)
			.json({
				status: 'success',
				data
			});
	}
	
	public error(
		res: Response,
		err: ErrorData,
		status: number = 500
	): Response {
		return res.status(status)
			.json({
				status: 'error',
				error: {
					message: err.error,
					code: err.code || status,
					details: err.details || null
				}
			});
	}
}
