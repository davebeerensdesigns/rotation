import {Router} from 'express';
import AuthController from '../controllers/auth.controller';

/**
 * Class representing authentication-related route definitions.
 *
 * Handles routes for nonce generation, signature verification, session retrieval,
 * token refreshing, and logout functionality.
 */
class AuthRoutes {
	public router = Router();
	private controller = new AuthController();
	
	constructor() {
		this.initializeRoutes();
	}
	
	/**
	 * Initializes authentication routes and binds them to controller methods.
	 *
	 * Routes:
	 * - GET /nonce
	 * - POST /verify
	 * - GET /session
	 * - POST /refresh
	 * - POST /logout
	 */
	private initializeRoutes(): void {
		this.router.get('/nonce',
			this.controller.nonce
		);
		this.router.post('/verify',
			this.controller.verify
		);
		this.router.get('/session',
			this.controller.session
		);
		this.router.post('/refresh',
			this.controller.refresh
		);
		this.router.post('/logout',
			this.controller.logout
		);
	}
}

export default new AuthRoutes().router;
