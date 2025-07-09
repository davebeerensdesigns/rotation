export interface BaseAuthPayload {
	userId: string;
	role: string;
	chainId: string;
	address: string;
}

export interface AccessTokenPayload extends BaseAuthPayload {
	accessToken: string;
}

export interface AccessEncTokenPayload extends AccessTokenPayload {
	sessionId: string;
	visitorId: string;
}

export interface RefreshTokenPayload extends BaseAuthPayload {
	refreshToken: string;
	sessionId: string;
	visitorId: string;
}
