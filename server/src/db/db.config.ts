import dotenv from 'dotenv';

dotenv.config();

export const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://localhost:27017';

export const DB_NAME: string = process.env.MONGODB_DB || 'siwe-auth';