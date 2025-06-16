import {Router} from 'express';
import AuthController from '../controllers/auth.controller';

class AuthRoutes {
	router = Router();
	controller = new AuthController();
	
	constructor() {
		this.intializeRoutes();
	}
	
	intializeRoutes() {
		
		this.router.post('/siwe-sync',
			this.controller.sync
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