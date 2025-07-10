import {z} from 'zod';

export const nonceRequestSchema = z.object({
	visitorId: z.string()
		.min(1)
});

export const messageParamsSchema = z.object({
	domain: z.string(),
	uri: z.string()
		.url(),
	statement: z.string()
});

export const verifyRequestSchema = z.object({
	message: z.string(),
	signature: z.string(),
	userAgent: z.string(),
	visitorId: z.string(),
	ipAddress: z.string()
		.optional()
});