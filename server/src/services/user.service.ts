import {type FindOneAndUpdateOptions, ObjectId, type UpdateFilter, type WithId} from 'mongodb';
import {getUsersCollection} from '../db/get-collection';
import {User} from '../types/user';

export class UserService {
	private static instance: UserService;
	
	private constructor() {}
	
	public static getInstance(): UserService {
		if (!UserService.instance) {
			UserService.instance = new UserService();
		}
		return UserService.instance;
	}
	
	async findOrCreateUser(
		address: string,
		chainId: string
	): Promise<User> {
		const users = getUsersCollection();
		
		const result = await users.findOneAndUpdate(
			{address},
			{
				$set: {chainId},
				$setOnInsert: {
					role: 'viewer',
					name: 'John',
					email: 'john@gmail.com',
					picture: '',
					address
				}
			},
			{
				upsert: true,
				returnDocument: 'after'
			}
		);
		
		if (!result) {
			throw new Error('[findOrCreateUser] Failed to create or fetch user.');
		}
		
		return result;
	}
	
	async findUserById(userId: string | ObjectId): Promise<User | null> {
		const users = getUsersCollection();
		const id = typeof userId === 'string' ? new ObjectId(userId) : userId;
		return users.findOne({_id: id});
	}
	
	async findAndUpdateUser(
		userId: string | ObjectId,
		data: Partial<User>
	): Promise<WithId<User> | null> {
		const users = getUsersCollection();
		const id = typeof userId === 'string' ? new ObjectId(userId) : userId;
		
		const options: FindOneAndUpdateOptions = {
			returnDocument: 'after'
		};
		
		const update: UpdateFilter<User> = {$set: data};
		
		return await users.findOneAndUpdate({_id: id},
			update,
			options
		);
	}
}
