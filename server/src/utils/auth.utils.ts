import {Request} from 'express';

export const extractBearerToken = (req: Request): string | null => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
	return authHeader.split(' ')[1];
};

export const buildUserResponse = (user: any) => ({
	userId: user._id,
	address: user.address,
	chainId: user.chainId,
	role: user.role,
	name: user.name,
	email: user.email,
	picture: user.picture
});