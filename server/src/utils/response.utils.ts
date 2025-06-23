import {Response} from 'express';

type SuccessData = Record<string, any>;
type ErrorData = { error: string; code?: number; details?: any };

/**
 * A function that sends a success response with status code 200 by default.
 *
 * @param {Response} res - The response object to send the success response.
 * @param {SuccessData} data - The data to be sent as part of the success response. Default is an empty object.
 * @param {number} status - The HTTP status code to be sent in the response. Default is 200.
 * @returns {Response} - The response object after sending the success response.
 */
export const success = (
	res: Response,
	data: SuccessData = {},
	status: number = 200
): Response => {
	return res.status(status)
		.json({
			status: 'success',
			data
		});
};

/**
 * Error handler function for returning error response.
 *
 * @param {Response} res - The response object to send the error response.
 * @param {ErrorData} err - Object containing error details such as message, code, and details.
 * @param {number} [status=500] - The HTTP status code to be sent in the response. Default is 500 (Internal Server Error).
 * @returns {Response} The response object with the error details in JSON format.
 */
export const error = (
	res: Response,
	err: ErrorData,
	status: number = 500
): Response => {
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
