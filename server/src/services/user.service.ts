import {
	FindOneAndUpdateOptions,
	ObjectId,
	UpdateFilter,
	WithId
} from 'mongodb';
import {User} from '../types/user';
import MongoDatabase from '../db';

export class UserService {
	private static instance: UserService;
	
	private constructor() {}
	
	public static getInstance(): UserService {
		if (!UserService.instance) {
			UserService.instance = new UserService();
		}
		return UserService.instance;
	}
	
	private getCollection() {
		return MongoDatabase.getInstance()
			.getUsersCollection();
	}
	
	public async findOrCreateUser(
		address: string,
		chainId: string
	): Promise<User> {
		const users = this.getCollection();
		
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
	
	public async findUserById(userId: string | ObjectId): Promise<User | null> {
		const users = this.getCollection();
		const id = typeof userId === 'string' ? new ObjectId(userId) : userId;
		return users.findOne({_id: id});
	}
	
	public async findAndUpdateUser(
		userId: string | ObjectId,
		data: Partial<User>
	): Promise<WithId<User> | null> {
		const users = this.getCollection();
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
