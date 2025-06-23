import {Request, Response} from 'express';
import {generateNonce} from 'siwe';

import {JwtUtils} from '../utils/jwt.utils';
import {UserService} from '../services/user.service';
import {ResponseUtils} from '../utils/response.utils';
import {AuthUtils} from '../utils/auth.utils';
import {TokenService} from '../services/token.service';
import {AuthService} from '../services/auth.service';

import {userCreateSchema} from '../validators/user.schema';
import {UserMapper} from '../mappers/user.mapper';
import {RequestUtils} from '../utils/request.utils';

const jwtService = JwtUtils.getInstance();
const userService = UserService.getInstance();
const tokenService = TokenService.getInstance();

export default class AuthController {
	async nonce(
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
					{
						error: 'SiweMessage is undefined or incomplete'
					},
					400
				);
			}
			
			const {
				address,
				chainId
			} = await AuthService.verifySiweSignature(message,
				signature
			);
			
			const parsed = userCreateSchema.safeParse({
				address,
				chainId
			});
			if (!parsed.success) {
				return ResponseUtils.error(res,
					{
						error: 'Invalid user data',
						details: parsed.error.flatten()
					},
					400
				);
			}
			
			const user = await userService.findOrCreateUser(address,
				chainId
			);
			
			const {
				accessToken,
				refreshToken
			} = jwtService.generateTokens(user._id.toString(),
				user.role
			);
			const decodedAccess = jwtService.decodeToken(accessToken);
			const accessTokenExpires = decodedAccess?.exp;
			
			await tokenService.storeRefreshToken(user._id,
				refreshToken
			);
			
			return ResponseUtils.success(res,
				{
					accessToken,
					refreshToken,
					accessTokenExpires,
					user: UserMapper.toResponse(user)
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
		
		try {
			const user = await RequestUtils.getAuthenticatedUser(req);
			if (!user) return ResponseUtils.error(res,
				{error: 'Unauthorized'},
				401
			);
			
			return ResponseUtils.success(res,
				{
					user: UserMapper.toResponse(user)
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
				{
					error: err.message
				},
				401
			);
		}
	}
}
