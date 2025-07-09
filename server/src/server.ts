import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import Server from './index';
import {logger} from './utils/logger.utils';

const app = express();

const server = new Server(app);

const PORT: number = process.env.PORT ? parseInt(process.env.PORT,
	10
) : 3001;

if (isNaN(PORT)) {
	logger.fatal('Invalid PORT value in environment variables');
	throw new Error('Invalid PORT value in environment variables');
}

// TODO: add tests
// TODO: add logging

(async () => {
	try {
		await server.start(PORT);
	} catch (err: unknown) {
		if (err instanceof Error) {
			logger.fatal({err},
				'Server failed to start'
			);
		} else {
			logger.fatal({err},
				'Server failed to start with unknown error'
			);
		}
		process.exit(1);
	}
})();
