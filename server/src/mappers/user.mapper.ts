import {UserEntity} from '../models/user.entity';
import {UserResponseDto} from '../dtos/user.dto';

export class UserMapper {
	static toResponse(user: UserEntity): UserResponseDto {
		return {
			userId: user._id?.toString() || '',
			address: user.address,
			chainId: user.chainId,
			role: user.role,
			name: user.name,
			email: user.email,
			picture: user.picture
		};
	}
}