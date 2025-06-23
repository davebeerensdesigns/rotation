import {ObjectId} from 'mongodb';

/**
 * Represents a user document stored in the database.
 *
 * @interface User
 * @property {ObjectId} [_id] - The unique MongoDB identifier for the user (optional before persistence).
 * @property {string} address - The user's wallet address (must be unique).
 * @property {string} chainId - The blockchain network identifier the user is associated with.
 * @property {string} role - The user's role (e.g., 'viewer', 'admin', etc.).
 * @property {string} name - The display name of the user.
 * @property {string} email - The email address of the user.
 * @property {string} picture - A URL or filename of the user's profile picture.
 */
export interface User {
	_id?: ObjectId;
	address: string;
	chainId: string;
	role: string;
	name: string;
	email: string;
	picture: string;
}
