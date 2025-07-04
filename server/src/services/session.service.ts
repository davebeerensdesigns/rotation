import {ObjectId} from 'mongodb';
import MongoDatabase from '../db';
import {getAddressFromMessage, getChainIdFromMessage, verifySignature} from '@reown/appkit-siwe';
import {v4 as uuidv4} from 'uuid';
import {SessionUtils} from '../utils/session.utils';
import {UserService} from './user.service';
import {SessionEntity} from '../models/session.entity';
import {userCreateSchema} from '../schemas/user.schema';
import {SessionMapper} from '../mappers/session.mapper';
import {SiweMessage} from 'siwe';
import {NonceService} from './nonce.service';

const sessionUtils = SessionUtils.getInstance();
const nonceService = NonceService.getInstance();
const userService = UserService.getInstance();

export class SessionService {
	private static instance: SessionService;
	private readonly projectId: string;
	
	private constructor() {
		const projectIdEnv = process.env.PROJECT_ID || '';
		if (!projectIdEnv) {
			throw new Error('Project id is required');
		}
		this.projectId = projectIdEnv;
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
	
	public async getMessageParams(): Promise<{
		domain: string;
		uri: string;
		statement: string;
	}> {
		const domain = process.env.CORS_HOST ?? 'localhost:3000';
		const uri = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
		const statement = 'Please sign with your account';
		
		return {
			domain,
			uri,
			statement
		};
	}
	
	public async loginAndCreateSession({
		message,
		signature,
		userAgent,
		visitorId,
		ipAddress
	}: {
		message: string;
		signature: string;
		userAgent: string;
		visitorId: string;
		ipAddress: string | null;
	}): Promise<{
		accessToken: string;
		refreshToken: string;
		accessTokenExpires: number;
		refreshTokenExpires: number;
		chainId: string;
		address: string;
		user: any;
	}> {
		const {
			address,
			chainId
		} = await this.verifySiweSignature({
			message,
			signature,
			visitorId
		});
		
		const parsed = userCreateSchema.safeParse({address});
		if (!parsed.success) {
			throw new Error('Invalid user data');
		}
		
		const user = await userService.findOrCreateUser(address);
		const sessionId = uuidv4();
		
		const {
			accessToken,
			refreshToken
		} = await sessionUtils.generateTokens({
			userId: user._id.toString(),
			role: user.role,
			sessionId,
			visitorId,
			chainId,
			address
		});
		
		const decodedAccess = sessionUtils.decodeToken(accessToken);
		const decodedRefresh = sessionUtils.decodeToken(refreshToken);
		if (!decodedAccess?.exp || !decodedRefresh?.exp) {
			throw new Error('Token expiry missing');
		}
		
		await this.removeAllSessionsByUserAndVisitorId({
			userId: user._id,
			visitorId
		});
		await this.storeSession({
			userId: user._id,
			refreshToken,
			chainId,
			userAgent,
			visitorId,
			sessionId,
			ipAddress
		});
		
		return {
			accessToken,
			refreshToken,
			accessTokenExpires: decodedAccess.exp,
			refreshTokenExpires: decodedRefresh.exp,
			chainId,
			address,
			user
		};
	}
	
	private async verifySiweSignature(
		{
			message,
			signature,
			visitorId
		}: {
			message: string,
			signature: string,
			visitorId: string
		}): Promise<{ address: string; chainId: string }> {
		const address = getAddressFromMessage(message) as `0x${string}`;
		const chainId = getChainIdFromMessage(message);
		
		const siweMessage = new SiweMessage(message);
		const nonce = siweMessage.nonce;
		const validNonce = await nonceService.validateAndRemoveNonce({
			nonce,
			visitorId
		});
		
		if (!validNonce) {
			throw new Error('Invalid nonce');
		}
		// The verifySignature is not working with social logins and emails with non deployed smart accounts.
		// If this is needed then use:
		// const client = createPublicClient({
		// 	transport: http(`https://rpc.walletconnect.org/v1/?chainId=${chainId}&projectId=${projectId}`)
		// });
		//
		// const isValid = await client.verifyMessage({
		// 	message,
		// 	address,
		// 	signature: signature as `0x${string}`
		// });
		
		const isValid = await verifySignature({
			address,
			message,
			signature,
			chainId,
			projectId: this.projectId
		});
		
		if (!isValid) {
			throw new Error('Invalid signature');
		}
		
		return {
			address,
			chainId
		};
	}
	
	public async rotateAccessToken({
		userId,
		visitorId,
		sessionId,
		chainId,
		address,
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
		const hashVisitorId = sessionUtils.hashToken(visitorId);
		
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
		
		await sessions.updateOne(
			{
				userId: user._id,
				sessionId,
				visitorId: hashVisitorId
			},
			{$set: {accessRotatedAt: new Date()}}
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
		const hashVisitorId = sessionUtils.hashToken(visitorId);
		
		return sessions.findOne({
			userId,
			sessionId,
			visitorId: hashVisitorId
		});
	}
	
	public async logoutUserCurrentSessionByValues({
		userId,
		sessionId,
		visitorId
	}: {
		userId: ObjectId;
		sessionId: string;
		visitorId: string;
	}): Promise<void> {
		const sessions = this.getCollection();
		const hashVisitorId = sessionUtils.hashToken(visitorId);
		
		await sessions.deleteOne({
			userId,
			sessionId,
			visitorId: hashVisitorId
		});
	}
	
	public async getAllSessionsMapped({
		userId,
		currentSessionId,
		currentVisitorId
	}: {
		userId: ObjectId;
		currentSessionId: string;
		currentVisitorId: string;
	}): Promise<any[]> {
		const sessions = await this.getAllUserSessionsByUserId(userId);
		if (!sessions) return [];
		
		return sessions.map(session =>
			SessionMapper.toResponse(
				session,
				session.sessionId === currentSessionId && session.visitorId === sessionUtils.hashToken(currentVisitorId)
			)
		);
	}
	
	private async getAllUserSessionsByUserId(userId: ObjectId): Promise<SessionEntity[] | null> {
		const sessions = this.getCollection();
		const allSessions = await sessions.find({userId})
			.toArray();
		return allSessions ?? null;
	}
	
	private async removeAllSessionsByUserAndVisitorId({
		userId,
		visitorId
	}: {
		userId: ObjectId;
		visitorId: string;
	}): Promise<void> {
		const sessions = this.getCollection();
		const hashVisitorId = sessionUtils.hashToken(visitorId);
		await sessions.deleteMany({
			userId,
			visitorId: hashVisitorId
		});
	}
	
	private async storeSession({
		userId,
		sessionId,
		visitorId,
		chainId,
		userAgent,
		refreshToken,
		ipAddress
	}: {
		userId: ObjectId;
		refreshToken: string;
		chainId: string;
		userAgent: string;
		visitorId: string;
		sessionId: string;
		ipAddress: string | null;
	}): Promise<void> {
		const sessions = this.getCollection();
		const hashedRefresh = sessionUtils.hashToken(refreshToken);
		const hashVisitorId = sessionUtils.hashToken(visitorId);
		await sessions.updateOne(
			{
				userId,
				visitorId: hashVisitorId,
				sessionId
			},
			{
				$set: {
					refreshToken: hashedRefresh,
					userAgent,
					sessionId,
					visitorId: hashVisitorId,
					chainId,
					createdAt: new Date(),
					ipAddress
				}
			},
			{upsert: true}
		);
	}
}
