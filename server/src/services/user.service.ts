import {FindOneAndUpdateOptions, ObjectId, UpdateFilter, WithId} from 'mongodb';
import MongoDatabase from '../db';
import {UserUpdateDto} from '../dtos/user.dto';
import {UserEntity} from '../models/user.entity';

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
	): Promise<WithId<UserEntity>> {
		const users = this.getCollection();
		
		const update: UpdateFilter<UserEntity> = {
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
	
	public async getUserByUserId(userId: ObjectId): Promise<UserEntity | null> {
		const users = this.getCollection();
		
		return await users.findOne({_id: userId});
	}
	
	public async findAndUpdateUser(
		userId: ObjectId,
		data: UserUpdateDto
	): Promise<WithId<UserEntity> | null> {
		const users = this.getCollection();
		
		const update: UpdateFilter<UserEntity> = {$set: data};
		const options: FindOneAndUpdateOptions = {returnDocument: 'after'};
		
		return await users.findOneAndUpdate({_id: userId},
			update,
			options
		);
	}
}
