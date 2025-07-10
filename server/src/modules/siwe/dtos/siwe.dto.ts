import {z} from 'zod';
import {messageParamsSchema, nonceRequestSchema, verifyRequestSchema} from '../schemas/siwe.schema';

export type VerifyRequestDto = z.infer<typeof verifyRequestSchema>;
export type MessageParamsDto = z.infer<typeof messageParamsSchema>;
export type NonceRequestDto = z.infer<typeof nonceRequestSchema>;