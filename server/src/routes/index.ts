import {Application} from 'express';
import authRoutes from './auth.routes';

export default class Routes {
	constructor(app: Application) {
		app.use('/api/auth',
			authRoutes
		);
	}
}