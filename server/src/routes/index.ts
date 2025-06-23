import {Application} from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

/**
 * Initializes and registers all route handlers for the Express application.
 *
 * This class is responsible for mounting all API route modules to their base paths.
 */
export default class Routes {
	/**
	 * Constructs the Routes instance and registers all defined routes on the provided Express app.
	 *
	 * @param {Application} app - The Express application instance to attach routes to.
	 */
	constructor(app: Application) {
		// Mount authentication-related routes at /api/auth
		app.use('/api/auth',
			authRoutes
		);
		// Mount user-related routes at /api/user
		app.use('/api/user',
			userRoutes
		);
	}
}
