import {Request} from 'express';
import {User} from '../types/user';

/**
 * Extracts the Bearer token from the Authorization header of the provided request object.
 *
 * @param {Request} req - The request object from which to extract the token.
 * @returns {string | null} The Bearer token extracted from the Authorization header, or null if not found.
 */
export const extractBearerToken = (req: Request): string | null => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
	return authHeader.split(' ')[1];
};

/**
 * Function to build a user response object based on input user object.
 *
 * @param {User} user - The user object from which to build the response.
 * @returns {Object} - The user response object containing userId, address, chainId, role, name, email, and picture.
 */
export const buildUserResponse = (user: User): object => ({
	userId: user._id,
	address: user.address,
	chainId: user.chainId,
	role: user.role,
	name: user.name,
	email: user.email,
	picture: user.picture
});