import {MongoClient, Collection} from 'mongodb';
import {User} from '../types/user';
import {RefreshToken} from '../types/refresh-token';
import {DB_NAME, MONGODB_URI} from '../config/db.config';

export default class MongoDatabase {
	private static instance: MongoDatabase;
	private client: MongoClient;
	public usersCollection?: Collection<User>;
	public tokensCollection?: Collection<RefreshToken>;
	
	private constructor() {
		this.client = new MongoClient(MONGODB_URI);
	}
	
	public static getInstance(): MongoDatabase {
		if (!MongoDatabase.instance) {
			MongoDatabase.instance = new MongoDatabase();
		}
		return MongoDatabase.instance;
	}
	
	public async connect(): Promise<void> {
		await this.client.connect();
		const db = this.client.db(DB_NAME);
		
		this.usersCollection = db.collection<User>('users');
		this.tokensCollection = db.collection<RefreshToken>('refreshTokens');
		
		console.log('MongoDB connected and collections initialized');
	}
}
