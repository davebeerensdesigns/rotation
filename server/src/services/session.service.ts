import {ObjectId} from 'mongodb';
import MongoDatabase from '../db';
import {getAddressFromMessage, getChainIdFromMessage} from '@reown/appkit-siwe';
import {createPublicClient, http} from 'viem';
import {SessionUtils} from '../utils/session.utils';
import {UserService} from './user.service';
import {SessionEntity} from '../models/session.entity';

const projectId = process.env.PROJECT_ID;
const sessionUtils = SessionUtils.getInstance();
const userService = UserService.getInstance();

export class SessionService {
	private static instance: SessionService;
	
	private constructor() {
	}
	
	public static getInstance(): SessionService {
		if (!SessionService.instance) {
			SessionService.instance = new SessionService();
		}
		return SessionService.instance;
	}
	
	private getCollection() {
		return MongoDatabase.getInstance()
			.getSessionsCollection();
	}
	
	public async verifySiweSignature(
		{
			message,
			signature
		}: {
			message: string,
			signature: string
		}): Promise<{ address: string; chainId: string }> {
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
	
	public async refreshAccessToken({
		userId,
		visitorId,
		chainId,
		address,
		sessionId,
		role
	}: {
		userId: ObjectId;
		visitorId: string;
		sessionId: string;
		chainId: string;
		address: string;
		role: string;
	}): Promise<{
		accessToken: string;
		accessTokenExpires: number;
	}> {
		const sessions = this.getCollection();
		
		const user = await userService.getUserByUserId(userId);
		if (!user || !user._id || !user.address) {
			throw new Error('User not found');
		}
		
		const accessToken = await sessionUtils.generateAccessToken({
			userId: user._id.toString(),
			role,
			sessionId,
			visitorId,
			chainId,
			address
		});
		
		const decoded = sessionUtils.decodeToken(accessToken);
		if (!decoded?.exp) {
			throw new Error('Access token is missing exp claim');
		}
		
		await sessions.updateOne({
				userId: user._id,
				sessionId,
				visitorId
			},
			{
				$set: {
					accessRotatedAt: new Date()
				}
			}
		);
		
		return {
			accessToken,
			accessTokenExpires: decoded.exp
		};
	}
	
	public async findExactSessionByValues({
		userId,
		sessionId,
		visitorId
	}: {
		userId: ObjectId;
		sessionId: string;
		visitorId: string;
	}): Promise<SessionEntity | null> {
		const sessions = this.getCollection();
		
		return sessions.findOne({
			userId,
			sessionId,
			visitorId
		});
	}
	
	public async logoutUserCurrentSessionByAccessToken({
		userId,
		sessionId,
		visitorId
	}: {
		userId: ObjectId;
		sessionId: string;
		visitorId: string;
	}): Promise<void> {
		const sessions = this.getCollection();
		
		await sessions.deleteOne({
			userId,
			sessionId,
			visitorId
		});
	}
	
	public async getAllUserSessionsByUserId(userId: ObjectId): Promise<SessionEntity[] | null> {
		const sessions = this.getCollection();
		const allSessions = await sessions.find({userId})
			.toArray();
		return allSessions ?? null;
	}
	
	public async storeSession({
		userId,
		sessionId,
		visitorId,
		chainId,
		address,
		userAgent,
		refreshToken
	}: {
		userId: ObjectId;
		refreshToken: string;
		chainId: string;
		userAgent: string;
		visitorId: string;
		sessionId: string;
		address: string;
	}): Promise<void> {
		const sessions = this.getCollection();
		const hashedRefresh = sessionUtils.hashToken(refreshToken);
		await sessions.updateOne(
			{
				userId,
				visitorId,
				sessionId
			},
			{
				$set: {
					refreshToken: hashedRefresh,
					userAgent,
					sessionId,
					visitorId,
					chainId,
					address,
					createdAt: new Date()
				}
			},
			{upsert: true}
		);
	}
}
