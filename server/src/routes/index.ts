import {Application} from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

export default class Routes {
	
	constructor(app: Application) {
		app.use('/api/auth',
			authRoutes
		);
		app.use('/api/user',
			userRoutes
		);
	}
}
