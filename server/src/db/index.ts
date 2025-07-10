import {MongoClient, Collection} from 'mongodb';
import {SessionEntity} from '../models/session.entity';
import {UserEntity} from '../models/user.entity';
import {NonceEntity} from '../models/nonce.entity';
import {COLLECTIONS, DB_NAME, MONGODB_URI, REFRESH_TOKEN_EXPIRY_SECONDS} from './db.config';
import {logger} from '../utils/logger.utils';

const MONGODB = '[MongoDatabase]';

export default class MongoDatabase {
	private static instance: MongoDatabase;
	private client: MongoClient;
	private isConnected = false;
	
	private usersCollection?: Collection<UserEntity>;
	private sessionsCollection?: Collection<SessionEntity>;
	private nonceCollection?: Collection<NonceEntity>;
	
	private constructor() {
		if (!MONGODB_URI || !DB_NAME) {
			logger.fatal(`${MONGODB} Missing MongoDB configuration. Check your .env file.`);
			throw new Error(`${MONGODB} Missing MongoDB configuration. Check your .env file.`);
		}
		this.client = new MongoClient(MONGODB_URI);
	}
	
	public static getInstance(): MongoDatabase {
		if (!MongoDatabase.instance) {
			MongoDatabase.instance = new MongoDatabase();
		}
		return MongoDatabase.instance;
	}
	
	public async connect(): Promise<void> {
		if (this.isConnected) return;
		
		await this.connectClient();
		this.initCollections();
		await this.initIndexes();
		this.isConnected = true;
		
		logger.info(`${MONGODB} Connected and initialized`);
		
		await this.cleanupExpiredSessions();
	}
	
	private async connectClient(): Promise<void> {
		await this.client.connect();
	}
	
	private initCollections(): void {
		const db = this.client.db(DB_NAME);
		this.usersCollection = db.collection<UserEntity>(COLLECTIONS.users);
		this.sessionsCollection = db.collection<SessionEntity>(COLLECTIONS.sessions);
		this.nonceCollection = db.collection<NonceEntity>(COLLECTIONS.nonce);
	}
	
	private async initIndexes(): Promise<void> {
		if (!this.usersCollection || !this.sessionsCollection || !this.nonceCollection) {
			logger.fatal(`${MONGODB} Collections are not initialized before creating indexes.`);
			throw new Error(`${MONGODB} Collections are not initialized before creating indexes.`);
		}
		
		await Promise.all([
			this.sessionsCollection.createIndex({
					userId: 1,
					sessionId: 1,
					visitorId: 1
				},
				{unique: true}
			),
			this.sessionsCollection.createIndex({userId: 1}),
			this.sessionsCollection.createIndex({refreshToken: 1}),
			this.sessionsCollection.createIndex({createdAt: 1}),
			
			this.usersCollection.createIndex({address: 1},
				{unique: true}
			),
			
			this.nonceCollection.createIndex({
					nonce: 1,
					visitorId: 1
				},
				{unique: true}
			),
			this.nonceCollection.createIndex({createdAt: 1},
				{expireAfterSeconds: 300}
			)
		]);
	}
	
	private async cleanupExpiredSessions(): Promise<void> {
		const sessions = this.getSessionsCollection();
		const expiryDate = new Date(Date.now() - REFRESH_TOKEN_EXPIRY_SECONDS * 1000);
		const result = await sessions.deleteMany({createdAt: {$lt: expiryDate}});
		
		logger.info(`${MONGODB} Cleaned up ${result.deletedCount} expired sessions`);
	}
	
	public getUsersCollection(): Collection<UserEntity> {
		if (!this.usersCollection) {
			logger.fatal(`${MONGODB} Not connected: usersCollection is undefined`);
			throw new Error(`${MONGODB} Not connected: usersCollection is undefined`);
		}
		return this.usersCollection;
	}
	
	public getSessionsCollection(): Collection<SessionEntity> {
		if (!this.sessionsCollection) {
			logger.fatal(`${MONGODB} Not connected: sessionsCollection is undefined`);
			throw new Error(`${MONGODB} Not connected: sessionsCollection is undefined`);
		}
		return this.sessionsCollection;
	}
	
	public getNonceCollection(): Collection<NonceEntity> {
		if (!this.nonceCollection) {
			logger.fatal(`${MONGODB} Not connected: nonceCollection is undefined`);
			throw new Error(`${MONGODB} Not connected: nonceCollection is undefined`);
		}
		return this.nonceCollection;
	}
}
