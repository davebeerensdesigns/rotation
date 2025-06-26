import {Router} from 'express';
import UserController from '../controllers/user.controller';
import {accessTokenMiddleware} from '../middlewares/access-token.middleware';

class UserRoutes {
	public router = Router();
	private controller = new UserController();
	
	constructor() {
		this.initializeRoutes();
	}
	
	private initializeRoutes(): void {
		this.router.get('/me',
			accessTokenMiddleware(),
			this.controller.me
		);
		this.router.patch('/update',
			accessTokenMiddleware(true),
			this.controller.update
		);
	}
}

export default new UserRoutes().router;
