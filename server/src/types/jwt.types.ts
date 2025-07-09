export interface PublicClaims {
	sub: string;
	role: string;
	chainId: string;
	address: string;
	iat?: number;
	exp?: number;
	enc?: string;
	token_type: 'access' | 'refresh';
	iss: string;
	aud: string;
}

export interface EncryptedClaims {
	sessionId: string;
	visitorId: string;
}

export type JwtPayload = PublicClaims & EncryptedClaims;