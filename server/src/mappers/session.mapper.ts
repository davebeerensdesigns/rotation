import {SessionEntity} from '../models/session.entity';
import {SessionResponseDto} from '../dtos/session.dto';

export class SessionMapper {
	static toResponse(session: SessionEntity): SessionResponseDto {
		return {
			sessionId: session.sessionId,
			visitorId: session.visitorId,
			userAgent: session.userAgent,
			chainId: session.chainId,
			createdAt: session.createdAt,
			ipAddress: session.ipAddress ?? null,
			rotatedAt: session.rotatedAt ?? null,
			rotatedTo: session.rotatedTo ?? null,
			revokedAt: session.revokedAt ?? null
		};
	}
	
	static toResponseArray(sessions: SessionEntity[]): SessionResponseDto[] {
		return sessions.map(this.toResponse);
	}
}