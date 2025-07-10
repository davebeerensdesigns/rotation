import {SessionEntity} from '../models/session.entity';
import {SessionResponseDto} from '../dtos/session.dto';

export class SessionMapper {
	static toResponse(
		session: SessionEntity,
		isCurrent = false
	): SessionResponseDto {
		return {
			userAgent: session.userAgent,
			chainId: session.chainId,
			createdAt: session.createdAt.toISOString(),
			ipAddress: session.ipAddress ?? null,
			isCurrent
		};
	}
}