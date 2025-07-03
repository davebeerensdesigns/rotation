import dotenv from 'dotenv';

dotenv.config();

import express, {Application} from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Routes from './routes';
import MongoDatabase from './db';

export default class Server {
	private app: Application;
	
	constructor(app: Application) {
		this.app = app;
		this.config();
		new Routes(this.app);
	}
	
	private config(): void {
		const corsOptions = {
			origin: process.env.CORS_ORIGIN || 'http://localhost:3000/',
			credentials: true
		};
		this.app.use(cors(corsOptions));
		this.app.use(cookieParser());
		this.app.use(express.json());
		this.app.use(express.urlencoded({extended: true}));
	}
	
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
