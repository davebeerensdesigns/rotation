import dotenv from 'dotenv';

dotenv.config();

/**
 * The MongoDB connection URI used by the application.
 *
 * Defaults to 'mongodb://localhost:27017' if not specified in environment variables.
 */
export const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://localhost:27017';

/**
 * The name of the MongoDB database to use.
 *
 * Defaults to 'siwe-auth' if not specified in environment variables.
 */
export const DB_NAME: string = process.env.MONGODB_DB || 'siwe-auth';