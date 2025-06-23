import {MongoClient, Collection} from 'mongodb';
import {RefreshToken} from '../types/refresh-token';
import {DB_NAME, MONGODB_URI} from './db.config';
import {User} from '../types/user.entity';

export default class MongoDatabase {
	private static instance: MongoDatabase;
	private client: MongoClient;
	private isConnected: boolean = false;
	
	private usersCollection?: Collection<User>;
	private tokensCollection?: Collection<RefreshToken>;
	
	private constructor() {
		if (!MONGODB_URI || !DB_NAME) {
			throw new Error('Missing MongoDB configuration. Check your .env file.');
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
		
		await this.client.connect();
		const db = this.client.db(DB_NAME);
		
		this.usersCollection = db.collection<User>('users');
		this.tokensCollection = db.collection<RefreshToken>('refreshTokens');
		
		this.isConnected = true;
		console.log('MongoDB connected and collections initialized');
	}
	
	public getUsersCollection(): Collection<User> {
		if (!this.usersCollection) {
			throw new Error('MongoDatabase not connected: usersCollection is undefined');
		}
		return this.usersCollection;
	}
	
	public getTokensCollection(): Collection<RefreshToken> {
		if (!this.tokensCollection) {
			throw new Error('MongoDatabase not connected: tokensCollection is undefined');
		}
		return this.tokensCollection;
	}
}
