import {MongoClient, Collection} from 'mongodb';
import {SessionEntity} from '../models/session.entity';
import {DB_NAME, MONGODB_URI} from './db.config';
import {UserEntity} from '../models/user.entity';
import {NonceEntity} from '../models/nonce.entity';

export default class MongoDatabase {
	private static instance: MongoDatabase;
	private client: MongoClient;
	private isConnected: boolean = false;
	private readonly refreshTokenExpiry: number;
	
	private usersCollection?: Collection<UserEntity>;
	private sessionsCollection?: Collection<SessionEntity>;
	private nonceCollection?: Collection<NonceEntity>;
	
	private constructor() {
		if (!MONGODB_URI || !DB_NAME) {
			throw new Error('Missing MongoDB configuration. Check your .env file.');
		}
		this.client = new MongoClient(MONGODB_URI);
		this.refreshTokenExpiry = parseInt(process.env.REFRESH_TOKEN_EXPIRY || '86400',
			10
		);
	}
	
	public static getInstance(): MongoDatabase {
		if (!MongoDatabase.instance) {
			MongoDatabase.instance = new MongoDatabase();
		}
		return MongoDatabase.instance;
	}
	
	public async connect(): Promise<void> {
		if (this.isConnected) return;
		
		await this.client.connect();
		const db = this.client.db(DB_NAME);
		
		this.usersCollection = db.collection<UserEntity>('users');
		this.sessionsCollection = db.collection<SessionEntity>('sessions');
		this.nonceCollection = db.collection<NonceEntity>('nonce');
		
		await this.sessionsCollection.createIndex(
			{
				userId: 1,
				sessionId: 1,
				visitorId: 1
			},
			{unique: true}
		);
		
		// Lookups
		await this.sessionsCollection.createIndex({userId: 1});
		await this.sessionsCollection.createIndex({refreshToken: 1});
		await this.sessionsCollection.createIndex({createdAt: 1});
		
		await this.nonceCollection.createIndex(
			{
				nonce: 1,
				visitorId: 1
			},
			{unique: true}
		);
		
		this.isConnected = true;
		console.log('MongoDB connected and collections initialized');
		
		await this.deleteExpiredSession();
	}
	
	public getUsersCollection(): Collection<UserEntity> {
		if (!this.usersCollection) {
			throw new Error('MongoDatabase not connected: usersCollection is undefined');
		}
		return this.usersCollection;
	}
	
	public getSessionsCollection(): Collection<SessionEntity> {
		if (!this.sessionsCollection) {
			throw new Error('MongoDatabase not connected: sessionsCollection is undefined');
		}
		return this.sessionsCollection;
	}
	
	public getNonceCollection(): Collection<NonceEntity> {
		if (!this.nonceCollection) {
			throw new Error('MongoDatabase not connected: nonceCollection is undefined');
		}
		return this.nonceCollection;
	}
	
	private async deleteExpiredSession(): Promise<void> {
		const expiryDate = new Date(Date.now() - this.refreshTokenExpiry * 1000);
		
		const sessions = this.getSessionsCollection();
		const result = await sessions.deleteMany({
			createdAt: {$lt: expiryDate}
		});
		
		console.log(`[SessionService] Cleaned up ${result.deletedCount} expired sessions`);
	}
}
