import {ObjectId} from 'mongodb';
import {getTokensCollection} from '../db/get-collection';

export class TokenService {
	private static instance: TokenService;
	
	private constructor() {}
	
	public static getInstance(): TokenService {
		if (!TokenService.instance) {
			TokenService.instance = new TokenService();
		}
		return TokenService.instance;
	}
	
	/**
	 * Stores or updates a refresh token for the given user.
	 *
	 * @param userId - The user's ObjectId.
	 * @param refreshToken - The refresh token string.
	 */
	public async storeRefreshToken(
		userId: ObjectId,
		refreshToken: string
	): Promise<void> {
		const tokens = getTokensCollection();
		await tokens.updateOne(
			{userId},
			{$set: {refreshToken}},
			{upsert: true}
		);
	}
	
	/**
	 * Verifies whether the provided refresh token matches the one stored in DB.
	 *
	 * @param userId - The user's ObjectId.
	 * @param token - The token to verify.
	 * @returns boolean - True if token matches, false otherwise.
	 */
	public async verifyStoredRefreshToken(
		userId: ObjectId,
		token: string
	): Promise<boolean> {
		const tokens = getTokensCollection();
		const saved = await tokens.findOne({userId});
		return !!saved && saved.refreshToken === token;
	}
	
	/**
	 * Deletes a stored refresh token for the given user.
	 *
	 * @param userId - The user's ObjectId.
	 */
	public async deleteRefreshToken(userId: ObjectId): Promise<void> {
		const tokens = getTokensCollection();
		await tokens.deleteOne({userId});
	}
}
