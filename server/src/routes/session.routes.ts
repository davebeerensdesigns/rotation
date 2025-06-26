import {Router} from 'express';
import SessionController from '../controllers/session.controller';

class SessionRoutes {
	public router = Router();
	private controller = new SessionController();
	
	constructor() {
		this.initializeRoutes();
	}
	
	private initializeRoutes(): void {
		this.router.get('/',
			this.controller.session
		);
		this.router.get('/all',
			this.controller.sessionAll
		);
		this.router.get('/nonce',
			this.controller.nonce
		);
		this.router.post('/verify',
			this.controller.verify
		);
		this.router.post('/refresh',
			this.controller.refresh
		);
		this.router.post('/logout',
			this.controller.logout
		);
	}
}

export default new SessionRoutes().router;
