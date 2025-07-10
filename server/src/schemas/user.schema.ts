import {z} from 'zod';

export const userCreateSchema = z.object({
	address: z.string()
		.startsWith('0x')
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
	role: z.string(),
	name: z.string()
		.optional(),
	email: z.string()
		.optional(),
	picture: z.string()
		.optional()
});