import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import Server from './src/index';

/**
 * Initializes the Express application instance.
 *
 * @constant {import('express').Application}
 */
const app = express();

/**
 * Creates a new instance of the application server, passing the Express app.
 *
 * @constant {Server}
 */
const server = new Server(app);

/**
 * The port on which the server will listen for incoming HTTP requests.
 *
 * Defaults to 3001 if not specified via environment variable `PORT`.
 *
 * @constant {number}
 */
const PORT = process.env.PORT ? parseInt(process.env.PORT,
	10
) : 3001;

/**
 * Asynchronously starts the application server.
 *
 * If server startup fails, the process exits with status 1.
 */
(async () => {
	try {
		await server.start(PORT); // start DB and Express server
	} catch (err) {
		console.error('Server failed to start:',
			err
		);
		process.exit(1);
	}
})();
