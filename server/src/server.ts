import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import Server from './index';

const app = express();

const server = new Server(app);

const PORT: number = process.env.PORT ? parseInt(process.env.PORT,
	10
) : 3001;

if (isNaN(PORT)) {
	throw new Error('Invalid PORT value in environment variables');
}

// TODO: correctly type every file
// TODO: add tests
// TODO: add logging

(async () => {
	try {
		await server.start(PORT);
	} catch (err: unknown) {
		if (err instanceof Error) {
			console.error('Server failed to start:',
				err.message,
				err.stack
			);
		} else {
			console.error('Server failed to start with unknown error:',
				err
			);
		}
		process.exit(1);
	}
})();
