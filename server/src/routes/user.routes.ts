import {Router} from 'express';
import UserController from '../controllers/user.controller';

class UserRoutes {
	public router = Router();
	private controller = new UserController();
	
	constructor() {
		this.initializeRoutes();
	}
	
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
