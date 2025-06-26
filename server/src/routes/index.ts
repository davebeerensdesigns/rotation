import {Application} from 'express';
import authRoutes from './session.routes';
import userRoutes from './user.routes';

export default class Routes {
	
	constructor(app: Application) {
		app.use('/api/session',
			authRoutes
		);
		app.use('/api/user',
			userRoutes
		);
	}
}
