import {Request, Response} from 'express';
import {decodeToken, generateTokens, verifyAccessToken, verifyRefreshToken} from '../utils/token.utils';
import {generateNonce} from 'siwe';
import {getAddressFromMessage, getChainIdFromMessage} from '@reown/appkit-siwe';
import {createPublicClient, http} from 'viem';
import {ObjectId} from 'mongodb';

import {error, success} from '../utils/response.utils';
import {extractBearerToken, buildUserResponse} from '../utils/auth.utils';
import {findOrCreateUser, findUserById} from '../services/user.service';
import {storeRefreshToken, verifyStoredRefreshToken, deleteRefreshToken} from '../services/token.service';

const projectId = process.env.PROJECT_ID;

export default class AuthController {
	async nonce(
		req: Request,
		res: Response
	) {
		const nonce = generateNonce();
		console.log('[NONCE]:',
			nonce
		);
		res.setHeader('Content-Type',
			'text/plain'
		);
		res.send(nonce);
	}
	
	async verify(
		req: Request,
		res: Response
	) {
		try {
			const {
				message,
				signature
			} = req.body;
			if (!message) return error(res,
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
			if (!isValid) throw new Error('Invalid signature');
			
			const user = await findOrCreateUser(address,
				chainId
			);
			const {
				accessToken,
				refreshToken
			} = generateTokens(user._id.toString(),
				user.role
			);
			const decodedAccess = decodeToken(accessToken);
			const accessTokenExpires = decodedAccess?.exp ?? null;
			
			await storeRefreshToken(user._id,
				refreshToken
			);
			
			return success(res,
				{
					accessToken,
					refreshToken,
					accessTokenExpires,
					user: buildUserResponse(user)
				}
			);
		} catch (err: any) {
			return error(res,
				{error: err.message},
				500
			);
		}
	}
	
	async session(
		req: Request,
		res: Response
	) {
		const token = extractBearerToken(req);
		if (!token) return error(res,
			{error: 'Authorization header missing or malformed'},
			401
		);
		
		try {
			const payload = verifyAccessToken(token);
			if (!payload?.sub) return error(res,
				{error: 'Invalid or expired access token'},
				401
			);
			
			const user = await findUserById(payload.sub);
			if (!user) return error(res,
				{error: 'User not found'},
				404
			);
			
			return success(res,
				{user: buildUserResponse(user)}
			);
		} catch (err: any) {
			return error(res,
				{error: err.message},
				401
			);
		}
	}
	
	async refresh(
		req: Request,
		res: Response
	) {
		const token = extractBearerToken(req);
		if (!token) return error(res,
			{error: 'Missing refreshToken'},
			400
		);
		
		try {
			const payload = verifyRefreshToken(token);
			if (!payload?.sub || !ObjectId.isValid(payload.sub)) {
				return error(res,
					{error: 'Invalid or expired refresh token'},
					401
				);
			}
			
			const userId = new ObjectId(payload.sub);
			const isValid = await verifyStoredRefreshToken(userId,
				token
			);
			if (!isValid) return error(res,
				{error: 'Token mismatch or revoked'},
				401
			);
			
			const user = await findUserById(userId);
			if (!user) return error(res,
				{error: 'User not found'},
				404
			);
			
			const {accessToken} = generateTokens(user._id.toString(),
				user.role
			);
			const decodedAccess = decodeToken(accessToken);
			const accessTokenExpires = decodedAccess?.exp ?? null;
			
			return success(res,
				{
					accessToken,
					accessTokenExpires
				}
			);
		} catch (err: any) {
			return error(res,
				{error: err.message},
				500
			);
		}
	}
	
	async logout(
		req: Request,
		res: Response
	) {
		const token = extractBearerToken(req);
		if (!token) return error(res,
			{error: 'Authorization header missing or malformed'},
			401
		);
		
		try {
			const decoded = verifyAccessToken(token);
			const userId = decoded?.sub;
			if (!userId || !ObjectId.isValid(userId)) {
				return error(res,
					{error: 'Invalid or missing userId in token'},
					401
				);
			}
			
			await deleteRefreshToken(new ObjectId(userId));
			return success(res,
				{success: true}
			);
		} catch (err: any) {
			return error(res,
				{error: err.message},
				500
			);
		}
	}
}
