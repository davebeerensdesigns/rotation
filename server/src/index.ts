import dotenv from 'dotenv';

dotenv.config();

import express, {Application} from 'express';
import cors, {CorsOptions} from 'cors';
import cookieParser from 'cookie-parser';
import Routes from './shared/routes';
import MongoDatabase from './shared/db';
import {logger} from './shared/utils/logger.utils';
import {requestLoggerMiddleware} from './shared/middlewares/request-logger.middleware';

const SERVER = '[Server]';
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
		this.app.use(requestLoggerMiddleware());
	}
	
	public async start(port: number): Promise<void> {
		const db = MongoDatabase.getInstance();
		await db.connect();
		
		this.app
			.listen(port,
				'localhost',
				() => {
					logger.info(`${SERVER} Listening on port ${port}`);
				}
			)
			.on('error',
				(err: NodeJS.ErrnoException) => {
					if (err.code === 'EADDRINUSE') {
						logger.fatal(`${SERVER} Port already in use`);
					} else {
						logger.fatal(`${SERVER} error:`,
							err
						);
					}
				}
			);
	}
}
