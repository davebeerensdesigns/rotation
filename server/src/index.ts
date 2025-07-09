import dotenv from 'dotenv';

dotenv.config();

import express, {Application} from 'express';
import cors, {CorsOptions} from 'cors';
import cookieParser from 'cookie-parser';
import Routes from './routes';
import MongoDatabase from './db';
import {logger} from './utils/logger.utils';

export default class Server {
	private app: Application;
	
	constructor(app: Application) {
		this.app = app;
		this.config();
		new Routes(this.app);
	}
	
	private config(): void {
		const corsOptions: CorsOptions = {
			origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000/',
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
					logger.info(`Server listening on port ${port}`);
				}
			)
			.on('error',
				(err: NodeJS.ErrnoException) => {
					if (err.code === 'EADDRINUSE') {
						logger.fatal('Port already in use');
					} else {
						logger.fatal('Server error:',
							err
						);
					}
				}
			);
	}
}
