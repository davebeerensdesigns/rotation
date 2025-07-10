import {Request} from 'express';

export const getClientIp = (req: Request): string | null => {
	const forwarded = req.headers['x-forwarded-for'];
	const xClientIp = req.headers['x-client-ip'];
	const remoteAddr = req.socket?.remoteAddress;

	if (typeof forwarded === 'string') {
		return forwarded.split(',')[0].trim();
	}
	if (typeof xClientIp === 'string') {
		return xClientIp;
	}
	return remoteAddr ?? null;
};
