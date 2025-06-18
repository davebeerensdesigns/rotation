import dotenv from 'dotenv';

dotenv.config();

import express, {Application} from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Routes from './routes';
import MongoDatabase from './db';

/**
 * Class representing an HTTP server using Express.
 *
 * Handles middleware configuration, route setup, and MongoDB connection.
 */
export default class Server {
	private app: Application;
	
	/**
	 * Creates an instance of the Server class.
	 *
	 * @param {Application} app - The Express application instance to be configured and started.
	 */
	constructor(app: Application) {
		this.app = app;
		this.config();
		new Routes(this.app);
	}
	
	/**
	 * Configures middleware for CORS, cookie parsing, JSON body parsing, and URL-encoded data.
	 */
	private config(): void {
		const corsOptions = {
			origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
			credentials: true
		};
		
		this.app.use(cors(corsOptions));
		this.app.use(cookieParser());
		this.app.use(express.json());
		this.app.use(express.urlencoded({extended: true}));
	}
	
	/**
	 * Starts the Express server on the specified port and connects to MongoDB.
	 *
	 * @param {number} port - The port number on which the server will listen.
	 * @returns {Promise<void>} A promise that resolves once the server is running.
	 */
	public async start(port: number): Promise<void> {
		const db = MongoDatabase.getInstance();
		await db.connect();
		
		this.app
			.listen(port,
				'localhost',
				() => {
					console.log(`Server running on port ${port}`);
				}
			)
			.on('error',
				(err: any) => {
					if (err.code === 'EADDRINUSE') {
						console.error('Port already in use');
					} else {
						console.error(err);
					}
				}
			);
	}
}
