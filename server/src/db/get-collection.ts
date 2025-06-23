import MongoDatabase from './index';
import {Collection} from 'mongodb';
import {User} from '../types/user';
import {RefreshToken} from '../types/refresh-token';

/**
 * Returns the MongoDB collection for user documents.
 *
 * This function must be called after `MongoDatabase.connect()` has been executed.
 *
 * @returns {Collection<User>} The initialized MongoDB collection for users.
 * @throws {Error} If the users collection has not been initialized.
 */
export function getUsersCollection(): Collection<User> {
	const db = MongoDatabase.getInstance();
	if (!db.usersCollection) {
		throw new Error('Users collection not initialized');
	}
	return db.usersCollection;
}

/**
 * Returns the MongoDB collection for refresh token documents.
 *
 * This function must be called after `MongoDatabase.connect()` has been executed.
 *
 * @returns {Collection<RefreshToken>} The initialized MongoDB collection for refresh tokens.
 * @throws {Error} If the tokens collection has not been initialized.
 */
export function getTokensCollection(): Collection<RefreshToken> {
	const db = MongoDatabase.getInstance();
	if (!db.tokensCollection) {
		throw new Error('Tokens collection not initialized');
	}
	return db.tokensCollection;
}
