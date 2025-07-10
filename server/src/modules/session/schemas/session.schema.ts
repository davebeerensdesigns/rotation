import {z} from 'zod';
import {userResponseSchema} from '../../user/schemas/user.schema';

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

export const sessionLoginResponseSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
	accessTokenExpires: z.number(),
	refreshTokenExpires: z.number(),
	chainId: z.string(),
	address: z.string(),
	user: userResponseSchema
});

export const loginRequestSchema = z.object({
	message: z.string(),
	signature: z.string(),
	visitorId: z.string(),
	userAgent: z.string(),
	ipAddress: z.string()
		.nullable()
});