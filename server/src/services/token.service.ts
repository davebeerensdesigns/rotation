import {ObjectId} from 'mongodb';
import {getTokensCollection} from '../db/get-collection';

export const storeRefreshToken = async (
	userId: ObjectId,
	refreshToken: string
) => {
	const tokens = getTokensCollection();
	await tokens.updateOne({userId},
		{$set: {refreshToken}},
		{upsert: true}
	);
};

export const verifyStoredRefreshToken = async (
	userId: ObjectId,
	token: string
) => {
	const tokens = getTokensCollection();
	const saved = await tokens.findOne({userId});
	return saved?.refreshToken === token;
};

export const deleteRefreshToken = async (userId: ObjectId) => {
	const tokens = getTokensCollection();
	await tokens.deleteOne({userId});
};