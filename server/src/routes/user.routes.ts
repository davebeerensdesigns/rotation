import {Router} from 'express';
import UserController from '../controllers/user.controller';

/**
 * Class representing authentication-related route definitions.
 *
 * Handles routes for nonce generation, signature verification, session retrieval,
 * token refreshing, and logout functionality.
 */
class UserRoutes {
	public router = Router();
	private controller = new UserController();
	
	constructor() {
		this.initializeRoutes();
	}
	
	/**
	 * Initializes authentication routes and binds them to controller methods.
	 *
	 * Routes:
	 * - PUT /update
	 */
	private initializeRoutes(): void {
		this.router.get('/me',
			this.controller.me
		);
		this.router.patch('/update',
			this.controller.update
		);
	}
}

export default new UserRoutes().router;
