import {ObjectId} from 'mongodb';

export interface RefreshToken {
	userId: ObjectId;
	refreshToken: string;
}