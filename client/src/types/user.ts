export type UserData = {
	userId: string;
	address: string;
	chainId: string;
	role: string;
	email?: string | null;
	name?: string | null;
	picture?: string | null;
};

export type UserSession = {
	chainId: string;
	userAgent: string;
	createdAt: string;
	ipAddress: string | null;
	isCurrent?: boolean;
}