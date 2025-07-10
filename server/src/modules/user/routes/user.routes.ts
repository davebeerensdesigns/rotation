import {Router} from 'express';
import UserController from '../controllers/user.controller';
import {verifyAccessTokenMiddleware} from '../../../shared/middlewares/verify-access-token.middleware';
import {verifyAccessTokenEncMiddleware} from '../../../shared/middlewares/verify-access-token-enc.middleware';

class UserRoutes {
	public router = Router();
	private controller = new UserController();
	
	constructor() {
		this.initializeRoutes();
	}
	
	private initializeRoutes(): void {
		this.router.get('/me',
			verifyAccessTokenMiddleware(),
			this.controller.me
		);
		this.router.patch('/update',
			verifyAccessTokenEncMiddleware(),
			this.controller.update
		);
	}
}

export default new UserRoutes().router;
