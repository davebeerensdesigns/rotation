import {Router} from 'express';
import AuthController from '../controllers/auth.controller';

class AuthRoutes {
	public router = Router();
	private controller = new AuthController();
	
	constructor() {
		this.initializeRoutes();
	}
	
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
		this.router.get('/session/all',
			this.controller.sessionAll
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
