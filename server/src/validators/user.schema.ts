import {z} from 'zod';

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

export const userCreateSchema = z.object({
	address: z.string()
		.startsWith('0x'),
	chainId: z.string()
});