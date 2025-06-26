import {ObjectId} from 'mongodb';
import MongoDatabase from '../db';
import {getAddressFromMessage, getChainIdFromMessage} from '@reown/appkit-siwe';
import {createPublicClient, http} from 'viem';
import {SessionUtils} from '../utils/session.utils';
import {UserService} from './user.service';
import {SessionEntity} from '../models/session.entity';

const projectId = process.env.PROJECT_ID;
const jwtService = SessionUtils.getInstance();
const userService = UserService.getInstance();

export class SessionService {
	private static instance: SessionService;
	
	private constructor() {}
	
	public static getInstance(): SessionService {
		if (!SessionService.instance) {
			SessionService.instance = new SessionService();
		}
		return SessionService.instance;
	}
	
	private getCollection() {
		return MongoDatabase.getInstance()
			.getTokensCollection();
	}
	
	public async verifySiweSignature(
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
	
	public async refreshAccessToken(refreshToken: string): Promise<{
		accessToken: string;
		accessTokenExpires: number;
	}> {
		const sessions = this.getCollection();
		const payload = jwtService.verifyRefreshToken(refreshToken);
		if (
			!payload?.sub ||
			!payload.sessionId ||
			!payload.visitorId ||
			!ObjectId.isValid(payload.sub)
		) {
			throw new Error('Invalid or expired refresh token');
		}
		
		const userId = new ObjectId(payload.sub);
		const sessionId = payload.sessionId;
		const visitorId = payload.visitorId;
		
		const saved = await sessions.findOne({
			userId,
			visitorId,
			sessionId
		});
		
		const isValid = !!saved && saved.refreshToken === refreshToken;
		
		if (!isValid) {
			throw new Error('Token mismatch or revoked');
		}
		
		const user = await userService.getUserByUserId(userId);
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
	
	public async findExactSession(accessToken: string): Promise<SessionEntity | null> {
		const sessions = this.getCollection();
		const payload = jwtService.verifyAccessToken(accessToken);
		if (
			!payload?.sub ||
			!payload.sessionId ||
			!payload.visitorId ||
			!ObjectId.isValid(payload.sub)
		) {
			throw new Error('Invalid or expired refresh token');
		}
		
		const userId = new ObjectId(payload.sub);
		const sessionId = payload.sessionId;
		const visitorId = payload.visitorId;
		return sessions.findOne({
			userId,
			sessionId,
			visitorId
		});
	}
	
	public async logoutUserCurrentSession(accessToken: string): Promise<void> {
		const sessions = this.getCollection();
		const payload = jwtService.verifyAccessToken(accessToken);
		if (
			!payload?.sub ||
			!payload.sessionId ||
			!payload.visitorId ||
			!ObjectId.isValid(payload.sub)
		) {
			throw new Error('Invalid or expired access token');
		}
		
		const userId = new ObjectId(payload.sub);
		const sessionId = payload.sessionId;
		const visitorId = payload.visitorId;
		
		await sessions.deleteOne({
			userId,
			sessionId,
			visitorId
		});
	}
	
	public async getAllUserSessionsFromAccessTokenSub(accessToken: string): Promise<SessionEntity[] | null> {
		const sessions = this.getCollection();
		
		let payload;
		try {
			payload = jwtService.verifyAccessToken(accessToken);
		} catch (err) {
			console.warn('[JWT] Failed to verify access token:',
				err
			);
			return null;
		}
		
		if (
			!payload?.sub ||
			!payload.sessionId ||
			!payload.visitorId ||
			!ObjectId.isValid(payload.sub)
		) {
			console.warn('[JWT] Payload invalid:',
				payload
			);
			return null;
		}
		
		const userId = new ObjectId(payload.sub);
		const allSessions = await sessions.find({userId})
			.toArray();
		return allSessions ?? null;
	}
	
	public async storeSession(
		userId: ObjectId,
		refreshToken: string,
		userAgent: string,
		visitorId: string,
		sessionId: string
	): Promise<void> {
		const sessions = this.getCollection();
		await sessions.updateOne(
			{
				userId,
				visitorId,
				sessionId
			},
			{
				$set: {
					refreshToken,
					userAgent,
					sessionId,
					visitorId,
					createdAt: new Date()
				}
			},
			{upsert: true}
		);
	}
	
}
