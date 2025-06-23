import {FindOneAndUpdateOptions, ObjectId, UpdateFilter, WithId} from 'mongodb';
import MongoDatabase from '../db';
import {UserUpdateDto} from '../dtos/user.dto';
import {User} from '../types/user.entity';

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
	): Promise<WithId<User>> {
		const users = this.getCollection();
		
		const update: UpdateFilter<User> = {
			$set: {chainId},
			$setOnInsert: {
				role: 'viewer',
				name: 'John',
				email: 'john@gmail.com',
				picture: '',
				address
			}
		};
		
		const options: FindOneAndUpdateOptions = {
			upsert: true,
			returnDocument: 'after'
		};
		
		const result = await users.findOneAndUpdate({address},
			update,
			options
		);
		
		if (!result) {
			throw new Error('[findOrCreateUser] Failed to create or fetch user.');
		}
		
		return result;
	}
	
	public async findUserById(
		userId: string | ObjectId
	): Promise<WithId<User> | null> {
		const users = this.getCollection();
		const id = typeof userId === 'string' ? new ObjectId(userId) : userId;
		return users.findOne({_id: id});
	}
	
	public async findAndUpdateUser(
		userId: string | ObjectId,
		data: UserUpdateDto
	): Promise<WithId<User> | null> {
		const users = this.getCollection();
		const id = typeof userId === 'string' ? new ObjectId(userId) : userId;
		
		const update: UpdateFilter<User> = {$set: data};
		const options: FindOneAndUpdateOptions = {returnDocument: 'after'};
		
		return await users.findOneAndUpdate({_id: id},
			update,
			options
		);
	}
}
