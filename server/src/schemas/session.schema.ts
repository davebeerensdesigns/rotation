import {z} from 'zod';

export const sessionResponseSchema = z.object({
	sessionId: z.string(),
	visitorId: z.string(),
	userAgent: z.string(),
	chainId: z.string(),
	createdAt: z.date(),
	ipAddress: z.string()
		.nullable()
		.optional(),
	rotatedAt: z.date()
		.nullable()
		.optional(),
	rotatedTo: z.string()
		.nullable()
		.optional(),
	revokedAt: z.date()
		.nullable()
		.optional()
});