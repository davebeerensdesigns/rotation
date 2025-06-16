import {Response} from 'express';

type SuccessData = Record<string, any>;
type ErrorData = { error: string; code?: number; details?: any };

export const success = (
	res: Response,
	data: SuccessData = {},
	status = 200
) => {
	return res.status(status)
		.json({
			status: 'success',
			data
		});
};

export const error = (
	res: Response,
	err: ErrorData,
	status = 500
) => {
	return res.status(status)
		.json({
			status: 'error',
			error: {
				message: err.error,
				code: err.code || status,
				details: err.details || null
			}
		});
};
