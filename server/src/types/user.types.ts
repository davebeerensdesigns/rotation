import {WithId} from 'mongodb';
import {UserEntity} from '../models/user.entity';

export type UserDocument = WithId<UserEntity>;