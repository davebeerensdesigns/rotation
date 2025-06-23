import {Request, Response} from 'express';
import {generateNonce} from 'siwe';
import {ObjectId} from 'mongodb';

import {User} from '../types/user';
import {JwtUtils} from '../utils/jwt.utils';
import {UserService} from '../services/user.service';
import {ResponseUtils} from '../utils/response.utils';
import {AuthUtils} from '../utils/auth.utils';
import {TokenService} from '../services/token.service';
import {AuthService} from '../services/auth.service';

// Singleton instance
const jwtService = JwtUtils.getInstance();
const userService = UserService.getInstance();
const tokenService = TokenService.getInstance();

// Utility type to ensure _id is present
type PersistedUser = User & { _id: ObjectId };

export default class AuthController {
	async nonce(
		req: Request,
		res: Response
	): Promise<void> {
		const nonce = generateNonce();
		res.setHeader('Content-Type',
			'text/plain'
		);
		res.send(nonce);
	}
	
	async verify(
		req: Request,
		res: Response
	): Promise<Response> {
		try {
			const {
				message,
				signature
			} = req.body;
			if (!message || !signature) {
				return ResponseUtils.error(res,
					{error: 'SiweMessage is undefined or incomplete'},
					400
				);
			}
			
			const {
				address,
				chainId
			} = await AuthService.verifySiweSignature(message,
				signature
			);
			
			const user = await userService.findOrCreateUser(address,
				chainId
			) as PersistedUser;
			
			const {
				accessToken,
				refreshToken
			} = jwtService.generateTokens(user._id.toString(),
				user.role
			);
			const decodedAccess = jwtService.decodeToken(accessToken);
			const accessTokenExpires = decodedAccess?.exp ?? null;
			
			await tokenService.storeRefreshToken(user._id,
				refreshToken
			);
			
			return ResponseUtils.success(res,
				{
					accessToken,
					refreshToken,
					accessTokenExpires,
					user: AuthUtils.buildUserResponse(user)
				}
			);
		} catch (err: any) {
			return ResponseUtils.error(res,
				{error: err.message},
				500
			);
		}
	}
	
	async session(
		req: Request,
		res: Response
	): Promise<Response> {
		const token = AuthUtils.extractBearerToken(req);
		if (!token) {
			return ResponseUtils.error(res,
				{
					error: 'Authorization header missing or malformed'
				},
				401
			);
		}
		
		try {
			const user = await AuthService.getUserFromAccessToken(token);
			
			if (!user) {
				return ResponseUtils.error(res,
					{
						error: 'Invalid or expired access token'
					},
					401
				);
			}
			
			return ResponseUtils.success(res,
				{
					user: AuthUtils.buildUserResponse(user)
				}
			);
		} catch (err: any) {
			return ResponseUtils.error(res,
				{
					error: err.message
				},
				500
			);
		}
	}
	
	async refresh(
		req: Request,
		res: Response
	): Promise<Response> {
		const token = AuthUtils.extractBearerToken(req);
		if (!token) {
			return ResponseUtils.error(res,
				{
					error: 'Missing refreshToken'
				},
				400
			);
		}
		
		try {
			const {
				accessToken,
				accessTokenExpires
			} = await AuthService.refreshAccessToken(token);
			
			return ResponseUtils.success(res,
				{
					accessToken,
					accessTokenExpires
				}
			);
		} catch (err: any) {
			return ResponseUtils.error(res,
				{
					error: err.message
				},
				401
			);
		}
	}
	
	async logout(
		req: Request,
		res: Response
	): Promise<Response> {
		const token = AuthUtils.extractBearerToken(req);
		if (!token) {
			return ResponseUtils.error(res,
				{
					error: 'Authorization header missing or malformed'
				},
				401
			);
		}
		
		try {
			await AuthService.logoutUser(token);
			return ResponseUtils.success(res,
				{success: true}
			);
		} catch (err: any) {
			return ResponseUtils.error(res,
				{error: err.message},
				401
			);
		}
	}
}
