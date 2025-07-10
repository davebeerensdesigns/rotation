import {
	sessionResponseSchema,
	sessionLoginResponseSchema
} from '../schemas/session.schema';
import {z} from 'zod';

export type SessionResponseDto = z.infer<typeof sessionResponseSchema>;
export type SessionLoginResponseDto = z.infer<typeof sessionLoginResponseSchema>;