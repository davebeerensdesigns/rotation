import {ObjectId} from 'mongodb';

export interface UserEntity {
	_id?: ObjectId;
	address: string;
	role: string;
	name: string;
	email: string;
	picture: string;
}