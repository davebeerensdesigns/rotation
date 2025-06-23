import {ObjectId} from 'mongodb';
import MongoDatabase from '../db';

export class TokenService {
	private static instance: TokenService;
	
	private constructor() {}
	
	public static getInstance(): TokenService {
		if (!TokenService.instance) {
			TokenService.instance = new TokenService();
		}
		return TokenService.instance;
	}
	
	private getCollection() {
		return MongoDatabase.getInstance()
			.getTokensCollection();
	}
	
	/**
	 * Stores or updates a refresh token for the given user.
	 */
	public async storeRefreshToken(
		userId: ObjectId,
		refreshToken: string
	): Promise<void> {
		const tokens = this.getCollection();
		await tokens.updateOne(
			{userId},
			{$set: {refreshToken}},
			{upsert: true}
		);
	}
	
	/**
	 * Verifies whether the provided refresh token matches the one stored in DB.
	 */
	public async verifyStoredRefreshToken(
		userId: ObjectId,
		token: string
	): Promise<boolean> {
		const tokens = this.getCollection();
		const saved = await tokens.findOne({userId});
		return !!saved && saved.refreshToken === token;
	}
	
	/**
	 * Deletes a stored refresh token for the given user.
	 */
	public async deleteRefreshToken(userId: ObjectId): Promise<void> {
		const tokens = this.getCollection();
		await tokens.deleteOne({userId});
	}
}
