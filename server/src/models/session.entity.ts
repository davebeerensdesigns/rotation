import {ObjectId} from 'mongodb';

export interface SessionEntity {
	_id?: ObjectId;
	userId: ObjectId;
	chainId: string;
	refreshToken: string;
	sessionId: string;
	visitorId: string;
	userAgent: string;
	createdAt: Date;
	accessRotatedAt?: Date | null;
	rotatedAt?: Date | null;
	rotatedTo?: string | null;
	revokedAt?: Date | null;
	ipAddress?: string | null;
}