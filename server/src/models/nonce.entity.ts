import {ObjectId} from 'mongodb';

export interface NonceEntity {
	_id?: ObjectId;
	nonce: string;
	visitorId: string;
}