import {Router} from 'express';
import SessionController from '../controllers/session.controller';
import {verifyAccessTokenEncMiddleware} from '../middlewares/verify-access-token-enc.middleware';
import {verifyRefreshTokenEncMiddleware} from '../middlewares/verify-refresh-token-enc.middleware';

class SessionRoutes {
	public router = Router();
	private controller = new SessionController();
	
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
		this.router.get('/',
			verifyAccessTokenEncMiddleware(),
			this.controller.session
		);
		this.router.get('/all',
			verifyAccessTokenEncMiddleware(),
			this.controller.sessionAll
		);
		this.router.post('/refresh',
			verifyRefreshTokenEncMiddleware(),
			this.controller.refresh
		);
		this.router.post('/logout',
			verifyAccessTokenEncMiddleware(),
			this.controller.logout
		);
	}
}

export default new SessionRoutes().router;
