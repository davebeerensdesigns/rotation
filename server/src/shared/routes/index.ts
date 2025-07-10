import {Application} from 'express';
import sessionRoutes from '../../modules/session/routes/session.routes';
import userRoutes from '../../modules/user/routes/user.routes';
import siweRoutes from '../../modules/siwe/routes/siwe.routes';

export default class Routes {
	
	constructor(app: Application) {
		app.use('/api/siwe',
			siweRoutes
		);
		app.use('/api/session',
			sessionRoutes
		);
		app.use('/api/user',
			userRoutes
		);
	}
}
