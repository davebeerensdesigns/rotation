import {z} from 'zod';

export const sessionResponseSchema = z.object({
	userAgent: z.string(),
	chainId: z.string(),
	createdAt: z.string()
		.datetime(),
	ipAddress: z.string()
		.nullable()
		.optional(),
	isCurrent: z.boolean()
		.optional()
});