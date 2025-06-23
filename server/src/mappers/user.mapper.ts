import {User} from '../types/user.entity';
import {UserResponseDto} from '../dtos/user.dto';

export class UserMapper {
	static toResponse(user: User): UserResponseDto {
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