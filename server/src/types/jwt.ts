export interface PublicClaims {
	sub: string;
	role: string;
	chainId: string;
	address: string;
	iat?: number;
	exp?: number;
	enc?: string;
}

export interface EncryptedClaims {
	sessionId: string;
	visitorId: string;
}

export type JwtPayload = PublicClaims & EncryptedClaims;