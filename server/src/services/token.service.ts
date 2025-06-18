import {ObjectId} from 'mongodb';
import {getTokensCollection} from '../db/get-collection';

/**
 * Stores or updates the refresh token for a specific user in the database.
 *
 * If a token already exists for the user, it is replaced.
 *
 * @param {ObjectId} userId - The MongoDB ObjectId of the user.
 * @param {string} refreshToken - The refresh token to store.
 * @returns {Promise<void>} A Promise that resolves when the operation completes.
 */
export const storeRefreshToken = async (
	userId: ObjectId,
	refreshToken: string
): Promise<void> => {
	const tokens = getTokensCollection();
	await tokens.updateOne(
		{userId},
		{$set: {refreshToken}},
		{upsert: true}
	);
};

/**
 * Checks whether the provided refresh token matches the one stored for the given user.
 *
 * @param {ObjectId} userId - The MongoDB ObjectId of the user.
 * @param {string} token - The refresh token to verify.
 * @returns {Promise<boolean>} A Promise that resolves to true if the token matches, false otherwise.
 */
export const verifyStoredRefreshToken = async (
	userId: ObjectId,
	token: string
): Promise<boolean> => {
	const tokens = getTokensCollection();
	const saved = await tokens.findOne({userId});
	return saved?.refreshToken === token;
};

/**
 * Deletes the stored refresh token associated with the given user.
 *
 * @param {ObjectId} userId - The MongoDB ObjectId of the user.
 * @returns {Promise<void>} A Promise that resolves when the token is successfully deleted.
 */
export const deleteRefreshToken = async (
	userId: ObjectId
): Promise<void> => {
	const tokens = getTokensCollection();
	await tokens.deleteOne({userId});
};
