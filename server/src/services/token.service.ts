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
	
	public async verifyStoredRefreshToken(
		userId: ObjectId,
		token: string
	): Promise<boolean> {
		const tokens = this.getCollection();
		const saved = await tokens.findOne({userId});
		return !!saved && saved.refreshToken === token;
	}
	
	public async deleteRefreshToken(userId: ObjectId): Promise<void> {
		const tokens = this.getCollection();
		await tokens.deleteOne({userId});
	}
}
