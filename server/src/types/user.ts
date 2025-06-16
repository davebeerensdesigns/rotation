import {ObjectId} from 'mongodb';

export interface User {
	_id?: ObjectId;
	wallet: string;
	chainId: string;
	role: string;
	name: string;
	email: string;
	picture: string;
}