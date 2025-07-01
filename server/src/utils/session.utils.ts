import dotenv from 'dotenv';
import {compactDecrypt, CompactEncrypt, JWTPayload, jwtVerify, SignJWT} from 'jose';
import {Request} from 'express';
import {JwtPayload, PublicClaims} from '../types/jwt';
import {createHash} from 'node:crypto';

dotenv.config();

export class SessionUtils {
	private static instance: SessionUtils;
	
	private readonly accessSecret: Uint8Array;
	private readonly refreshSecret: Uint8Array;
	private readonly encryptionSecret: Uint8Array;
	private readonly accessTokenExpiry: number;
	private readonly refreshTokenExpiry: number;
	
	private constructor() {
		const accessSecretEnv = process.env.JWT_SECRET || '';
		const refreshSecretEnv = process.env.REFRESH_SECRET || '';
		const encryptionSecretEnv = process.env.ENCRYPTION_SECRET || '';
		
		this.accessSecret = Buffer.from(accessSecretEnv,
			'base64'
		);
		this.refreshSecret = Buffer.from(refreshSecretEnv,
			'base64'
		);
		this.encryptionSecret = Buffer.from(encryptionSecretEnv,
			'base64'
		);
		
		this.accessTokenExpiry = parseInt(process.env.ACCESS_TOKEN_EXPIRY || '600',
			10
		);
		this.refreshTokenExpiry = parseInt(process.env.REFRESH_TOKEN_EXPIRY || '86400',
			10
		);
		
		if (
			this.accessSecret.length !== 32 ||
			this.refreshSecret.length !== 32 ||
			this.encryptionSecret.length !== 32
		) {
			console.error('One or more secrets are not 256-bit (32 bytes) in length. Check your .env values.');
			process.exit(1);
		}
	}
	
	public static getInstance(): SessionUtils {
		if (!SessionUtils.instance) {
			SessionUtils.instance = new SessionUtils();
		}
		return SessionUtils.instance;
	}
	
	public extractBearerToken(req: Request): string | null {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
		return authHeader.split(' ')[1];
	}
	
	public hashToken(token: string): string {
		return createHash('sha256')
			.update(token)
			.digest('hex');
	}
	
	private async generateTokenPayload({
		sessionId,
		visitorId
	}: {
		sessionId: string;
		visitorId: string;
	}): Promise<string> {
		const innerPayload = JSON.stringify({
			sessionId,
			visitorId
		});
		
		return await new CompactEncrypt(new TextEncoder().encode(innerPayload))
			.setProtectedHeader({
				alg: 'dir',
				enc: 'A256GCM'
			})
			.encrypt(this.encryptionSecret);
	}
	
	public async generateAccessToken({
		userId,
		sessionId,
		visitorId,
		chainId,
		address,
		role
	}: {
		userId: string;
		role: string;
		sessionId: string;
		visitorId: string;
		chainId: string;
		address: string;
	}): Promise<string> {
		const encryptedInner = await this.generateTokenPayload({
				sessionId,
				visitorId
			}
		);
		
		return await new SignJWT({
			sub: userId,
			chainId,
			role,
			address,
			enc: encryptedInner,
			token_type: 'access',
			iss: 'auth-service',
			aud: 'api-gateway'
		})
			.setProtectedHeader({alg: 'HS256'})
			.setIssuedAt()
			.setExpirationTime(`${this.accessTokenExpiry}s`)
			.sign(this.accessSecret);
	}
	
	public async generateTokens({
		userId,
		sessionId,
		visitorId,
		chainId,
		role,
		address
	}: {
		userId: string;
		role: string;
		sessionId: string;
		visitorId: string;
		chainId: string;
		address: string;
	}): Promise<{ accessToken: string; refreshToken: string }> {
		const encryptedInner = await this.generateTokenPayload({
			sessionId,
			visitorId
		});
		
		const accessToken = await new SignJWT({
			sub: userId,
			chainId,
			role,
			address,
			enc: encryptedInner,
			token_type: 'access',
			iss: 'auth-service',
			aud: 'api-gateway'
		})
			.setProtectedHeader({alg: 'HS256'})
			.setIssuedAt()
			.setExpirationTime(`${this.accessTokenExpiry}s`)
			.sign(this.accessSecret);
		
		const refreshToken = await new SignJWT({
			sub: userId,
			chainId,
			role,
			address,
			enc: encryptedInner,
			token_type: 'access',
			iss: 'auth-service',
			aud: 'api-gateway'
		})
			.setProtectedHeader({alg: 'HS256'})
			.setIssuedAt()
			.setExpirationTime(`${this.refreshTokenExpiry}s`)
			.sign(this.refreshSecret);
		
		return {
			accessToken,
			refreshToken
		};
	}
	
	public async verifyAccessToken(token: string): Promise<PublicClaims | null> {
		try {
			const {payload} = await jwtVerify(token,
				this.accessSecret
			);
			return payload as unknown as PublicClaims;
		} catch {
			return null;
		}
	}
	
	public async verifyAccessTokenAndDecryptEnc(token: string): Promise<JwtPayload | null> {
		try {
			const {payload} = await jwtVerify(token,
				this.accessSecret
			);
			const decrypted = await this.decryptNestedPayload(payload);
			return {...payload, ...decrypted} as JwtPayload;
		} catch {
			return null;
		}
	}
	
	public async verifyRefreshTokenAndDecryptEnc(token: string): Promise<JwtPayload | null> {
		try {
			const {payload} = await jwtVerify(token,
				this.refreshSecret
			);
			const decrypted = await this.decryptNestedPayload(payload);
			return {...payload, ...decrypted} as JwtPayload;
		} catch {
			return null;
		}
	}
	
	public decodeToken(token: string): JwtPayload | null {
		try {
			const decoded = JSON.parse(Buffer.from(token.split('.')[1],
					'base64'
				)
				.toString());
			return decoded as JwtPayload;
		} catch {
			return null;
		}
	}
	
	public async decryptNestedPayload(payload: JWTPayload): Promise<Record<string, any>> {
		const enc = payload.enc as string;
		if (!enc) throw new Error('Missing encrypted session payload');
		
		const {plaintext} = await compactDecrypt(enc,
			this.encryptionSecret
		);
		return JSON.parse(new TextDecoder().decode(plaintext));
	}
}
