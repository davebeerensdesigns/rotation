import {MongoClient, Collection} from 'mongodb';
import {User} from '../types/user';
import {RefreshToken} from '../types/refresh-token';
import {DB_NAME, MONGODB_URI} from '../config/db.config';

/**
 * Singleton class that manages the MongoDB client connection and exposes specific collections.
 *
 * Use `MongoDatabase.getInstance()` to access the shared database instance.
 * Ensure that `connect()` is called before accessing any collections.
 */
export default class MongoDatabase {
	private static instance: MongoDatabase;
	private client: MongoClient;
	
	/**
	 * The MongoDB collection for user documents.
	 * This property is available only after `connect()` has been called.
	 */
	public usersCollection?: Collection<User>;
	
	/**
	 * The MongoDB collection for refresh token documents.
	 * This property is available only after `connect()` has been called.
	 */
	public tokensCollection?: Collection<RefreshToken>;
	
	/**
	 * Private constructor to enforce the singleton pattern.
	 */
	private constructor() {
		this.client = new MongoClient(MONGODB_URI);
	}
	
	/**
	 * Retrieves the shared singleton instance of MongoDatabase.
	 *
	 * @returns {MongoDatabase} The single MongoDatabase instance.
	 */
	public static getInstance(): MongoDatabase {
		if (!MongoDatabase.instance) {
			MongoDatabase.instance = new MongoDatabase();
		}
		return MongoDatabase.instance;
	}
	
	/**
	 * Connects to the MongoDB server and initializes the required collections.
	 *
	 * This must be called once before using `usersCollection` or `tokensCollection`.
	 *
	 * @returns {Promise<void>} A promise that resolves when the connection is established and collections are initialized.
	 */
	public async connect(): Promise<void> {
		await this.client.connect();
		const db = this.client.db(DB_NAME);
		
		this.usersCollection = db.collection<User>('users');
		this.tokensCollection = db.collection<RefreshToken>('refreshTokens');
		
		console.log('MongoDB connected and collections initialized');
	}
}
