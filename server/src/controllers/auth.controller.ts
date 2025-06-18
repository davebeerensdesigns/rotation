import {Request, Response} from 'express';
import {decodeToken, generateTokens, verifyAccessToken, verifyRefreshToken} from '../utils/token.utils';
import {User} from '../types/user';
import {ObjectId} from 'mongodb';
import {getTokensCollection, getUsersCollection} from '../db/get-collection';
import {success, error} from '../utils/response.utils';

export default class AuthController {
	async sync(
		req: Request,
		res: Response
	) {
		const {
			address,
			chainId
		} = req.body;
		
		if (!address) {
			return error(res,
				{error: 'Missing address address'},
				400
			);
		}
		if (!chainId) {
			return error(res,
				{error: 'Missing chain id'},
				400
			);
		}
		
		try {
			const users = getUsersCollection();
			const tokens = getTokensCollection();
			
			let user = await users.findOne({address});
			
			if (!user) {
				const newUser: User = {
					address,
					chainId,
					role: 'viewer',
					name: 'John',
					email: 'john@gmail.com',
					picture: 'avatar.jpg'
				};
				const result = await users.insertOne(newUser);
				user = {
					...newUser,
					_id: result.insertedId
				};
			}
			
			await users.updateOne(
				{address},
				{$set: {chainId}},
				{upsert: true}
			);
			
			const {
				accessToken,
				refreshToken
			} = generateTokens(user._id!.toString(),
				user.role
			);
			const decodedAccess = decodeToken(accessToken);
			const accessTokenExpires = decodedAccess && typeof decodedAccess === 'object' ? decodedAccess.exp : null;
			
			await tokens.updateOne(
				{userId: user._id},
				{$set: {refreshToken}},
				{upsert: true}
			);
			return success(res,
				{
					accessToken,
					refreshToken,
					accessTokenExpires,
					user: {
						userId: user._id,
						address: user.address,
						chainId: user.chainId,
						role: user.role,
						name: user.name,
						email: user.email,
						picture: user.picture
					}
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
		const authHeader = req.headers.authorization;
		
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return error(res,
				{error: 'Authorization header missing or malformed'},
				401
			);
		}
		
		const token = authHeader.split(' ')[1];
		
		try {
			const users = getUsersCollection();
			const payload = verifyAccessToken(token);
			if (!payload) {
				return error(res,
					{error: 'Invalid or expired access token'},
					401
				);
			}
			const userId = payload.sub;
			if (!userId) {
				return error(res,
					{error: 'Token payload missing subject'},
					401
				);
			}
			
			const user = await users.findOne({_id: new ObjectId(userId)});
			if (!user) {
				return error(res,
					{error: 'User not found'},
					404
				);
			}
			return success(res,
				{
					user: {
						userId: user._id,
						address: user.address,
						chainId: user.chainId,
						role: user.role,
						name: user.name,
						email: user.email,
						picture: user.picture
					}
				}
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
		const authHeader = req.headers.authorization;
		
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return error(res,
				{error: 'Authorization header missing or malformed'},
				401
			);
		}
		
		const token = authHeader.split(' ')[1];
		
		if (!token) {
			return error(res,
				{error: 'Missing refreshToken'},
				400
			);
		}
		
		try {
			const users = getUsersCollection();
			const tokens = getTokensCollection();
			
			const payload = verifyRefreshToken(token);
			if (!payload || !payload.sub || !ObjectId.isValid(payload.sub)) {
				return error(res,
					{error: 'Invalid or expired refresh token'},
					401
				);
			}
			
			const userId = new ObjectId(payload.sub);
			
			const saved = await tokens.findOne({userId});
			if (!saved || saved.refreshToken !== token) {
				return error(res,
					{error: 'Token mismatch of revoked'},
					401
				);
			}
			
			const user = await users.findOne({_id: userId});
			if (!user) {
				return error(res,
					{error: 'User not found'},
					404
				);
			}
			
			const {accessToken: newAccessToken} = generateTokens(user._id.toString(),
				user.role
			);
			const decodedAccess = decodeToken(newAccessToken);
			const accessTokenExpires =
				decodedAccess && typeof decodedAccess === 'object' ? decodedAccess.exp : null;
			
			return success(res,
				{
					accessToken: newAccessToken,
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
		const authHeader = req.headers.authorization;
		
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return error(res,
				{error: 'Authorization header missing or malformed'},
				401
			);
		}
		
		const accessToken = authHeader.split(' ')[1];
		
		try {
			const tokens = getTokensCollection();
			
			const decoded = verifyAccessToken(accessToken);
			const userId = decoded?.sub;
			
			if (!userId || !ObjectId.isValid(userId)) {
				return error(res,
					{error: 'Invalid or missing userId in token'},
					401
				);
			}
			
			const objectUserId = new ObjectId(userId);
			
			await tokens.deleteOne({userId: objectUserId});
			
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