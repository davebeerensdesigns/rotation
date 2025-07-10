import {Router} from 'express';
import SiweController from '../controllers/siwe.controller';

class SiweRoutes {
	public router = Router();
	private controller = new SiweController();
	
	constructor() {
		this.initializeRoutes();
	}
	
	private initializeRoutes(): void {
		this.router.post('/nonce',
			this.controller.nonce
		);
		this.router.get('/message-params',
			this.controller.messageParams
		);
		this.router.post('/verify',
			this.controller.verify
		);
	}
}

export default new SiweRoutes().router;
