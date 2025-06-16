import MongoDatabase from './index';
import {Collection} from 'mongodb';
import {User} from '../types/user';
import {RefreshToken} from '../types/refresh-token';

export function getUsersCollection(): Collection<User> {
	const db = MongoDatabase.getInstance();
	if (!db.usersCollection) {
		throw new Error('Users collection not initialized');
	}
	return db.usersCollection;
}

export function getTokensCollection(): Collection<RefreshToken> {
	const db = MongoDatabase.getInstance();
	if (!db.tokensCollection) {
		throw new Error('Tokens collection not initialized');
	}
	return db.tokensCollection;
}
