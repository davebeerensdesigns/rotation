import {z} from 'zod';

export const userCreateSchema = z.object({
	address: z.string()
		.startsWith('0x'),
	chainId: z.string()
});

export const userUpdateSchema = z.object({
	name: z.string()
		.min(2)
		.optional(),
	email: z.string()
		.email()
		.optional(),
	picture: z.string()
		.optional()
});

export const userResponseSchema = z.object({
	userId: z.string(),
	address: z.string(),
	chainId: z.string(),
	role: z.string(),
	name: z.string(),
	email: z.string(),
	picture: z.string()
});