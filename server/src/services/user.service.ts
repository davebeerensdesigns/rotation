import {type FindOneAndUpdateOptions, ObjectId, type UpdateFilter, type WithId} from 'mongodb';
import {getUsersCollection} from '../db/get-collection';
import {User} from '../types/user';

/**
 * Finds an existing user by their wallet address or creates a new user if none exists.
 *
 * If the user is created, default values are used for name, email, and picture.
 * The chainId is also updated on every call.
 *
 * @param {string} address - The user's wallet address (must be unique).
 * @param {string} chainId - The blockchain network identifier.
 * @returns {Promise<User>} A Promise that resolves to the existing or newly created user with a MongoDB ObjectId.
 */
export const findOrCreateUser = async (
	address: string,
	chainId: string
): Promise<User> => {
	const users = getUsersCollection();
	let user = await users.findOne({address});
	
	if (!user) {
		const newUser: User = {
			address,
			chainId,
			role: 'viewer',
			name: 'John',
			email: 'john@gmail.com',
			picture: ''
		};
		const result = await users.insertOne(newUser);
		user = {
			...newUser,
			_id: result.insertedId
		};
	}
	
	// Ensure chainId is always up to date
	await users.updateOne({address},
		{$set: {chainId}},
		{upsert: true}
	);
	
	return user;
};

/**
 * Retrieves a user document by their unique MongoDB ObjectId.
 *
 * Accepts either an ObjectId instance or a string representation of it.
 *
 * @param {string | ObjectId} userId - The user's MongoDB ObjectId or its string form.
 * @returns {Promise<User | null>} A Promise that resolves to the user object if found, or null otherwise.
 */
export const findUserById = async (
	userId: string | ObjectId
): Promise<User | null> => {
	const users = getUsersCollection();
	const id = typeof userId === 'string' ? new ObjectId(userId) : userId;
	return users.findOne({_id: id});
};

export const findAndUpdateUser = async (
	userId: string | ObjectId,
	data: Partial<User>
): Promise<WithId<User> | null> => {
	const users = getUsersCollection();
	const id = typeof userId === 'string' ? new ObjectId(userId) : userId;
	
	const options: FindOneAndUpdateOptions = {
		returnDocument: 'after' // (v5.x): returns updated doc
	};
	
	const update: UpdateFilter<User> = {$set: data};
	
	return await users.findOneAndUpdate({_id: id},
		update,
		options
	);
};
