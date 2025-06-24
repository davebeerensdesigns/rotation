// auth.service.ts
import {createPublicClient, http} from 'viem';
import {getAddressFromMessage, getChainIdFromMessage} from '@reown/appkit-siwe';
import {JwtUtils} from '../utils/jwt.utils';
import {UserService} from './user.service';
import {TokenService} from './token.service';
import {ObjectId} from 'mongodb';
import {User} from '../types/user.entity';

const projectId = process.env.PROJECT_ID;

const jwtService = JwtUtils.getInstance();
const userService = UserService.getInstance();
const tokenService = TokenService.getInstance();

export class AuthService {
	static async verifySiweSignature(
		message: string,
		signature: string
	): Promise<{ address: string; chainId: string }> {
		const address = getAddressFromMessage(message) as `0x${string}`;
		const chainId = getChainIdFromMessage(message);
		
		const client = createPublicClient({
			transport: http(`https://rpc.walletconnect.org/v1/?chainId=${chainId}&projectId=${projectId}`)
		});
		
		const isValid = await client.verifyMessage({
			message,
			address,
			signature: signature as `0x${string}`
		});
		if (!isValid) {
			throw new Error('Invalid signature');
		}
		
		return {
			address,
			chainId
		};
	}
	
	static async getUserFromAccessToken(token: string): Promise<User | null> {
		const payload = jwtService.verifyAccessToken(token);
		if (typeof payload?.sub !== 'string' || !ObjectId.isValid(payload.sub)) {
			throw new Error('Invalid or expired access token');
		}
		
		const user = await userService.findUserById(payload.sub);
		if (!user) throw new Error('User not found');
		
		return user;
	}
	
	static async refreshAccessToken(refreshToken: string): Promise<{
		accessToken: string;
		accessTokenExpires: number;
	}> {
		const payload = jwtService.verifyRefreshToken(refreshToken);
		
		if (
			!payload?.sub ||
			!ObjectId.isValid(payload.sub)
		) {
			throw new Error('Invalid or expired refresh token');
		}
		
		const userId = new ObjectId(payload.sub);
		const sessionId = payload.sessionId;
		
		const isValid = await tokenService.verifyStoredRefreshToken(
			userId,
			refreshToken,
			payload.visitorId
		);
		
		if (!isValid) {
			throw new Error('Token mismatch or revoked');
		}
		
		const user = await userService.findUserById(userId);
		if (!user || !user._id) {
			throw new Error('User not found');
		}
		
		const {accessToken} = jwtService.generateTokens(
			user._id.toString(),
			user.role,
			sessionId,
			payload.visitorId
		);
		
		const decoded = jwtService.decodeToken(accessToken);
		if (!decoded?.exp) {
			throw new Error('Access token is missing exp claim');
		}
		
		return {
			accessToken,
			accessTokenExpires: decoded.exp
		};
	}
	
	static async logoutUser(accessToken: string): Promise<void> {
		const decoded = jwtService.verifyAccessToken(accessToken);
		
		if (typeof decoded?.sub !== 'string' || !ObjectId.isValid(decoded.sub)) {
			throw new Error('Invalid or missing userId in token');
		}
		
		const userId = new ObjectId(decoded.sub);
		const sessionId = decoded.sessionId;
		await tokenService.deleteRefreshToken(userId,
			sessionId
		);
	}
	
	static async getUserSessionsFromAccessToken(token: string): Promise<any | null> {
		const decoded = jwtService.verifyAccessToken(token);
		
		if (typeof decoded?.sub !== 'string' || !ObjectId.isValid(decoded.sub)) {
			throw new Error('Invalid or missing userId in token');
		}
		
		const userId = new ObjectId(decoded.sub);
		const sessions = await tokenService.findSessionsByUserId(userId);
		
		if (!sessions) throw new Error('No sessions found found');
		
		return sessions;
	}
}
