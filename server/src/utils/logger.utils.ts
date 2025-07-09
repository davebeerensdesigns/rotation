import pino from 'pino';
import dotenv from 'dotenv';

dotenv.config();
const env = process.env.NODE_ENV || 'development';

let logger: pino.Logger;

if (env === 'development') {
	logger = pino({
		level: 'debug',
		formatters: {
			level(label) {
				return {level: label};
			}
		},
		timestamp: pino.stdTimeFunctions.isoTime,
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true,
				translateTime: 'SYS:standard',
				ignore: 'pid,hostname'
			}
		}
	});
} else {
	logger = pino({
		level: 'silent'
	});
}

export {logger};
