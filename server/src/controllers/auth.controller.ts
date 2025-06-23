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
import {User} from '../types/user';

const projectId = process.env.PROJECT_ID;

// Utility type to ensure _id is present
type PersistedUser = User & { _id: ObjectId };

/**
 * Controller class for handling authentication-related operations.
 *
 * Supports SIWE login, JWT token issuance and rotation, session validation,
 * and logout via refresh token invalidation.
 */
export default class AuthController {
	/**
	 * Generates a nonce string and sends it as a plain text response.
	 *
	 * Typically used in authentication flows (e.g. Sign-In With Ethereum).
	 *
	 * @param {Request} req - The Express request object.
	 * @param {Response} res - The Express response object.
	 * @returns {Promise<void>} A Promise that resolves after sending the nonce.
	 */
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
	
	/**
	 * Verifies a signed SIWE message and issues access and refresh tokens.
	 *
	 * @param {Request} req - The Express request object containing the SIWE message and signature.
	 * @param {Response} res - The Express response object used to send back tokens and user info.
	 * @returns {Promise<Response>} A Promise resolving to a response with tokens, expiration time, and user data.
	 */
	async verify(
		req: Request,
		res: Response
	): Promise<Response> {
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
			if (!isValid) {
				return error(res,
					{error: 'Invalid signature'},
					400
				);
			}
			
			const user = await findOrCreateUser(address,
				chainId
			) as PersistedUser;
			
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
	
	/**
	 * Validates the access token from the Authorization header and returns associated user info.
	 *
	 * @param {Request} req - The Express request object with a bearer access token in the Authorization header.
	 * @param {Response} res - The Express response object used to send back the session user data or error.
	 * @returns {Promise<Response>} A Promise resolving to a response with user info or error.
	 */
	async session(
		req: Request,
		res: Response
	): Promise<Response> {
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
			
			return success(res);
		} catch (err: any) {
			return error(res,
				{error: err.message},
				401
			);
		}
	}
	
	/**
	 * Refreshes an access token using a valid refresh token.
	 *
	 * Verifies the refresh token's signature and checks it against stored values for the user.
	 * If valid, a new access token is issued.
	 *
	 * @param {Request} req - The Express request containing a bearer refresh token.
	 * @param {Response} res - The response object used to send the new access token or an error.
	 * @returns {Promise<Response>} A Promise resolving to a response with the new access token and expiration timestamp.
	 */
	async refresh(
		req: Request,
		res: Response
	): Promise<Response> {
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
			
			const {accessToken} = generateTokens(user._id!.toString(),
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
	
	/**
	 * Logs out the user by deleting the stored refresh token.
	 *
	 * Validates the access token to identify the user and revokes the corresponding refresh token.
	 * Responds with a confirmation or appropriate error if the token is missing or invalid.
	 *
	 * @param {Request} req - The request object containing the access token in the Authorization header.
	 * @param {Response} res - The response object used to send the logout confirmation or error.
	 * @returns {Promise<Response>} A Promise resolving to a success response or an error.
	 */
	async logout(
		req: Request,
		res: Response
	): Promise<Response> {
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
