import {Request} from 'express';
import {User} from '../types/user';

/**
 * Utility class for authentication-related helpers.
 *
 * Includes functions for extracting bearer tokens and formatting user data.
 */
export class AuthUtils {
	/**
	 * Extracts the Bearer token from the Authorization header of the provided request object.
	 *
	 * @param {Request} req - The request object from which to extract the token.
	 * @returns {string | null} The Bearer token extracted from the Authorization header, or null if not found.
	 */
	static extractBearerToken(req: Request): string | null {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
		return authHeader.split(' ')[1];
	}
	
	/**
	 * Builds a sanitized user response object.
	 *
	 * @param {User} user - The user object from the database.
	 * @returns {Object} A simplified and safe user response object.
	 */
	static buildUserResponse(user: User): object {
		return {
			userId: user._id,
			address: user.address,
			chainId: user.chainId,
			role: user.role,
			name: user.name,
			email: user.email,
			picture: user.picture
		};
	}
}
