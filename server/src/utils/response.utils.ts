import {Response} from 'express';

type SuccessData = Record<string, any>;
type ErrorData = { error: string; code?: number; details?: any };

/**
 * Utility class for sending standardized HTTP responses.
 *
 * Provides static methods for success and error formatting.
 */
export class ResponseUtils {
	/**
	 * Sends a success response with status code 200 by default.
	 *
	 * @param {Response} res - The response object to send the response.
	 * @param {SuccessData} data - The data to include in the response. Defaults to an empty object.
	 * @param {number} status - HTTP status code. Default is 200.
	 * @returns {Response} - The response object.
	 */
	static success(
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
	
	/**
	 * Sends an error response with status code 500 by default.
	 *
	 * @param {Response} res - The response object to send the error.
	 * @param {ErrorData} err - An object containing message, optional code and details.
	 * @param {number} status - HTTP status code. Default is 500.
	 * @returns {Response} - The response object.
	 */
	static error(
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
