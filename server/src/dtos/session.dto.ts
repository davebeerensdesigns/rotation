import {
	sessionResponseSchema,
	messageParamsSchema,
	verifyRequestSchema,
	nonceRequestSchema,
	sessionLoginResponseSchema, loginRequestSchema
} from '../schemas/session.schema';
import {z} from 'zod';

export type SessionResponseDto = z.infer<typeof sessionResponseSchema>;
export type VerifyRequestDto = z.infer<typeof verifyRequestSchema>;
export type MessageParamsDto = z.infer<typeof messageParamsSchema>;
export type NonceRequestDto = z.infer<typeof nonceRequestSchema>;
export type SessionLoginResponseDto = z.infer<typeof sessionLoginResponseSchema>;
export type LoginRequestDto = z.infer<typeof loginRequestSchema>;