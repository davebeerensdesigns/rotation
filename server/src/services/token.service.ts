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
		refreshToken: string,
		userAgent: string,
		visitorId: string,
		sessionId: string
	): Promise<void> {
		const tokens = this.getCollection();
		await tokens.updateOne(
			{
				userId,
				visitorId
			},
			{
				$set: {
					refreshToken,
					userAgent,
					sessionId,
					createdAt: new Date()
				}
			},
			{upsert: true}
		);
	}
	
	public async verifyStoredRefreshToken(
		userId: ObjectId,
		token: string,
		visitorId: string
	): Promise<boolean> {
		const tokens = this.getCollection();
		const saved = await tokens.findOne({
			userId,
			visitorId
		});
		
		return !!saved && saved.refreshToken === token;
	}
	
	public async deleteRefreshToken(
		userId: ObjectId,
		sessionId: string
	): Promise<void> {
		const tokens = this.getCollection();
		await tokens.deleteOne({
			userId,
			sessionId
		});
	}
	
	public async findSessionsByUserId(userId: ObjectId) {
		const tokens = this.getCollection();
		
		return tokens.find({
				userId
			})
			.toArray();
	}
}
