import {Request, Response} from 'express';
import {generateNonce} from 'siwe';
import {getAddressFromMessage, getChainIdFromMessage} from '@reown/appkit-siwe';
import {createPublicClient, http} from 'viem';
import {ObjectId} from 'mongodb';

import {User} from '../types/user';
import {JwtUtils} from '../utils/jwt.utils';
import {UserService} from '../services/user.service';
import {ResponseUtils} from '../utils/response.utils';
import {AuthUtils} from '../utils/auth.utils';
import {TokenService} from '../services/token.service';

const projectId = process.env.PROJECT_ID;

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
			if (!message) return ResponseUtils.error(res,
				{error: 'SiweMessage is undefined'},
				400
			);
			
			const address = getAddressFromMessage(message) as `0x${string}`;
			const chainId = getChainIdFromMessage(message);
			
			const publicClient = createPublicClient({
				transport: http(`https://rpc.walletconnect.org/v1/?chainId=${chainId}&projectId=${projectId}`)
			});
			
			const isValid = await publicClient.verifyMessage({
				message,
				address,
				signature
			});
			
			if (!isValid) {
				return ResponseUtils.error(res,
					{error: 'Invalid signature'},
					400
				);
			}
			
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
		if (!token) return ResponseUtils.error(res,
			{error: 'Authorization header missing or malformed'},
			401
		);
		
		try {
			const payload = jwtService.verifyAccessToken(token);
			if (!payload?.sub) return ResponseUtils.error(res,
				{error: 'Invalid or expired access token'},
				401
			);
			
			const user = await userService.findUserById(payload.sub);
			if (!user) return ResponseUtils.error(res,
				{error: 'User not found'},
				404
			);
			
			return ResponseUtils.success(res);
		} catch (err: any) {
			return ResponseUtils.error(res,
				{error: err.message},
				401
			);
		}
	}
	
	async refresh(
		req: Request,
		res: Response
	): Promise<Response> {
		const token = AuthUtils.extractBearerToken(req);
		if (!token) return ResponseUtils.error(res,
			{error: 'Missing refreshToken'},
			400
		);
		
		try {
			const payload = jwtService.verifyRefreshToken(token);
			if (!payload?.sub || !ObjectId.isValid(payload.sub)) {
				return ResponseUtils.error(res,
					{error: 'Invalid or expired refresh token'},
					401
				);
			}
			
			const userId = new ObjectId(payload.sub);
			const isValid = await tokenService.verifyStoredRefreshToken(userId,
				token
			);
			if (!isValid) return ResponseUtils.error(res,
				{error: 'Token mismatch or revoked'},
				401
			);
			
			const user = await userService.findUserById(userId);
			if (!user || !user._id) return ResponseUtils.error(res,
				{error: 'User not found'},
				404
			);
			
			const {accessToken} = jwtService.generateTokens(user._id.toString(),
				user.role
			);
			const decodedAccess = jwtService.decodeToken(accessToken);
			const accessTokenExpires = decodedAccess?.exp ?? null;
			
			return ResponseUtils.success(res,
				{
					accessToken,
					accessTokenExpires
				}
			);
		} catch (err: any) {
			return ResponseUtils.error(res,
				{error: err.message},
				500
			);
		}
	}
	
	async logout(
		req: Request,
		res: Response
	): Promise<Response> {
		const token = AuthUtils.extractBearerToken(req);
		if (!token) return ResponseUtils.error(res,
			{error: 'Authorization header missing or malformed'},
			401
		);
		
		try {
			const decoded = jwtService.verifyAccessToken(token);
			const userId = decoded?.sub;
			if (!userId || !ObjectId.isValid(userId)) {
				return ResponseUtils.error(res,
					{error: 'Invalid or missing userId in token'},
					401
				);
			}
			
			await tokenService.deleteRefreshToken(new ObjectId(userId));
			return ResponseUtils.success(res,
				{success: true}
			);
		} catch (err: any) {
			return ResponseUtils.error(res,
				{error: err.message},
				500
			);
		}
	}
}
