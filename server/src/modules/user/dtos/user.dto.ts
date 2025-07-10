import {userUpdateSchema, userResponseSchema} from '../schemas/user.schema';
import {z} from 'zod';

export type UserUpdateDto = z.infer<typeof userUpdateSchema>;
export type UserResponseDto = z.infer<typeof userResponseSchema>;