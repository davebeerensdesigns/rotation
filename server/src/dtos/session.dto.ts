import {sessionResponseSchema} from '../schemas/session.schema';
import {z} from 'zod';

export type SessionResponseDto = z.infer<typeof sessionResponseSchema>;