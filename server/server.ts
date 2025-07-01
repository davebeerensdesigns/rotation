import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import Server from './src/index';

const app = express();

const server = new Server(app);

const PORT = process.env.PORT ? parseInt(process.env.PORT,
	10
) : 3001;

// TODO: correctly type every file
// TODO: make DRY
// TODO: add tests
// TODO: add logging

(async () => {
	try {
		await server.start(PORT);
	} catch (err) {
		console.error('Server failed to start:',
			err
		);
		process.exit(1);
	}
})();
