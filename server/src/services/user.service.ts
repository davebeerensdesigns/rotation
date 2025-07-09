import {FindOneAndUpdateOptions, ObjectId, UpdateFilter} from 'mongodb';
import MongoDatabase from '../db';
import {UserEntity} from '../models/user.entity';
import {userUpdateSchema} from '../schemas/user.schema';
import {ValidationError} from '../errors/validation-error';
import {UserDocument} from '../types/user.types';

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
		address: string
	): Promise<UserDocument> {
		const users = this.getCollection();
		
		const update: UpdateFilter<UserEntity> = {
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
	
	public async getUserByUserId(userId: ObjectId): Promise<UserDocument | null> {
		const users = this.getCollection();
		return await users.findOne({_id: userId});
	}
	
	public async findAndUpdateUser({
		userId,
		data
	}: {
		userId: ObjectId,
		data: unknown
	}): Promise<UserDocument | null> {
		const parsed = userUpdateSchema.safeParse(data);
		if (!parsed.success) {
			throw new ValidationError('Validation failed',
				parsed.error.flatten()
			);
		}
		const users = this.getCollection();
		const update: UpdateFilter<UserEntity> = {$set: parsed.data};
		const options: FindOneAndUpdateOptions = {returnDocument: 'after'};
		
		return await users.findOneAndUpdate({_id: userId},
			update,
			options
		);
	}
}
