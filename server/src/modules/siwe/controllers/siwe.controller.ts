import {Request, Response} from 'express';

import {ResponseUtils} from '../../../shared/utils/response.utils';
import {UserMapper} from '../../user/mappers/user.mapper';
import {ErrorResponse} from '../../../shared/dtos/error.dto';
import {ValidationError} from '../../../shared/errors/validation-error';
import {logDevOnly, logger} from '../../../shared/utils/logger.utils';
import {SessionService} from '../../session/services/session.service';
import {SiweService} from '../services/siwe.service';
import {SessionLoginResponseDto} from '../../session/dtos/session.dto';
import {getClientIp} from '../../../shared/utils/ip.utils';
import {MessageParamsDto, NonceRequestDto, VerifyRequestDto} from '../dtos/siwe.dto';

const CONTROLLER = '[SessionController]';

const sessionService = SessionService.getInstance();
const siweService = SiweService.getInstance();
const responseUtils = ResponseUtils.getInstance();

export default class SiweController {
	async nonce(
		req: Request<Record<string, never>, unknown, NonceRequestDto>,
		res: Response<{ nonce: string } | ErrorResponse>
	): Promise<Response> {
		try {
			const nonce = await siweService.generateAndSaveNonce(req.body.visitorId);
			logger.debug(`${CONTROLLER} Generated nonce for visitor`);
			return responseUtils.success(res,
				{nonce}
			);
		} catch (err: any) {
			logger.error(`${CONTROLLER} Failed to generate nonce:`,
				err
			);
			return responseUtils.error(res,
				{
					error: err.message ?? 'Unexpected error generating nonce'
				},
				500
			);
		}
	}
	
	async messageParams(
		req: Request,
		res: Response<MessageParamsDto | ErrorResponse>
	): Promise<Response> {
		try {
			const data = await siweService.getMessageParams();
			logger.debug(`${CONTROLLER} Retrieved message params`);
			return responseUtils.success(res,
				data
			);
		} catch (err: any) {
			logger.error(`${CONTROLLER} Failed to retrieve message params:`,
				err
			);
			return responseUtils.error(res,
				{
					error: 'Failed to retrieve message params'
				},
				500
			);
		}
	}
	
	async verify(
		req: Request<Record<string, never>, unknown, VerifyRequestDto>,
		res: Response<SessionLoginResponseDto | ErrorResponse>
	): Promise<Response> {
		const ipAddress = req.body.ipAddress || getClientIp(req);
		
		try {
			const result = await sessionService.loginAndCreateSession({
				...req.body,
				ipAddress
			});
			
			logger.info(`${CONTROLLER} Verified and logged in user: ${result.address}`);
			logDevOnly(`${CONTROLLER} Tokens issued for ${result.address}`);
			
			return responseUtils.success(res,
				{
					accessToken: result.accessToken,
					refreshToken: result.refreshToken,
					accessTokenExpires: result.accessTokenExpires,
					refreshTokenExpires: result.refreshTokenExpires,
					chainId: result.chainId,
					address: result.address,
					user: UserMapper.toResponse(result.user)
				}
			);
		} catch (err: any) {
			if (err instanceof ValidationError) {
				logger.warn(`${CONTROLLER} Validation failed during login:`,
					err.details
				);
				return responseUtils.error(res,
					{
						error: err.message,
						details: err.details
					},
					400
				);
			}
			logger.error(`${CONTROLLER} Unexpected error during login:`,
				err
			);
			return responseUtils.error(res,
				{
					error: err.message ?? 'Unexpected error verifying session',
					details: err.details ?? undefined
				},
				500
			);
		}
	}
}
