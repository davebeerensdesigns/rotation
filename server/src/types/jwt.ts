export interface JwtPayload {
	sub: string;
	role: string;
	iat?: number;
	exp?: number;
	visitorId: string;
	sessionId: string;
	chainId: string;
}