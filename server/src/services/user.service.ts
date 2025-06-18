import {ObjectId} from 'mongodb';
import {getUsersCollection} from '../db/get-collection';
import {User} from '../types/user';

export const findOrCreateUser = async (
	address: string,
	chainId: string
): Promise<User & { _id: ObjectId }> => {
	const users = getUsersCollection();
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
	
	await users.updateOne({address},
		{$set: {chainId}},
		{upsert: true}
	);
	return user;
};

export const findUserById = async (userId: string | ObjectId) => {
	const users = getUsersCollection();
	return users.findOne({_id: new ObjectId(userId)});
};