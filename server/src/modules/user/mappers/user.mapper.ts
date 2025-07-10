import {UserEntity} from '../models/user.entity';
import {UserResponseDto} from '../dtos/user.dto';

export class UserMapper {
	static toResponse(user: UserEntity): UserResponseDto {
		return {
			userId: (user._id ?? user.userId)?.toString() || '',
			address: user.address,
			role: user.role,
			name: user.name,
			email: user.email,
			picture: user.picture
		};
	}
}