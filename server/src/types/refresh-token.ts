import {ObjectId} from 'mongodb';

/**
 * Represents a refresh token object with user ID and token string.
 */
export interface RefreshToken {
	userId: ObjectId;
	refreshToken: string;
}