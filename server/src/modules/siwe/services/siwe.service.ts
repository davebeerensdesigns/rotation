import MongoDatabase from '../../../shared/db';
import {generateNonce, SiweMessage} from 'siwe';
import {SessionUtils} from '../../session/utils/session.utils';
import {logger} from '../../../shared/utils/logger.utils';
import {getAddressFromMessage, getChainIdFromMessage, verifySignature} from '@reown/appkit-siwe';

const SERVICE = '[SiweService]';
const sessionUtils = SessionUtils.getInstance();

export class SiweService {
	private static instance: SiweService;
	private readonly projectId: string;
	
	private constructor() {
		const projectIdEnv = process.env.PROJECT_ID || '';
		if (!projectIdEnv) {
			logger.fatal(`${SERVICE} PROJECT_ID is missing in environment`);
			throw new Error(`${SERVICE} PROJECT_ID is required`);
		}
		this.projectId = projectIdEnv;
	}
	
	public static getInstance(): SiweService {
		if (!SiweService.instance) {
			SiweService.instance = new SiweService();
		}
		return SiweService.instance;
	}
	
	private getCollection() {
		return MongoDatabase.getInstance()
			.getNonceCollection();
	}
	
	public async generateAndSaveNonce(visitorId: string) {
		const nonceCollection = this.getCollection();
		const nonce = generateNonce();
		const hashVisitorId = sessionUtils.hashToken(visitorId);
		await nonceCollection.insertOne({
				visitorId: hashVisitorId,
				nonce: nonce,
				createdAt: new Date()
			}
		);
		
		return nonce;
	}
	
	private async validateAndRemoveNonce({
		nonce,
		visitorId
	}: { nonce: string, visitorId: string }) {
		
		const nonceCollection = this.getCollection();
		const hashVisitorId = sessionUtils.hashToken(visitorId);
		const valid = await nonceCollection.findOneAndDelete({
			nonce,
			visitorId: hashVisitorId
		});
		
		if (!valid) {
			logger.warn(`${SERVICE} Invalid nonce for visitor ${hashVisitorId}`);
		}
		
		return valid !== null;
	}
	
	public async getMessageParams(): Promise<{
		domain: string;
		uri: string;
		statement: string;
	}> {
		const domain = process.env.CORS_HOST ?? 'localhost:3000';
		const uri = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
		const statement = 'Please sign with your account';
		logger.info(`${SERVICE} Generated message parameters`);
		return {
			domain,
			uri,
			statement
		};
	}
	
	public async verifySiweSignature(
		{
			message,
			signature,
			visitorId
		}: {
			message: string,
			signature: string,
			visitorId: string
		}): Promise<{ address: string; chainId: string }> {
		const address = getAddressFromMessage(message) as `0x${string}`;
		const chainId = getChainIdFromMessage(message);
		
		const siweMessage = new SiweMessage(message);
		const nonce = siweMessage.nonce;
		const validNonce = await this.validateAndRemoveNonce({
			nonce,
			visitorId
		});
		
		if (!validNonce) {
			logger.warn(`${SERVICE} Invalid nonce for visitorId`);
			throw new Error(`${SERVICE} Invalid nonce`);
		}
		// The verifySignature is not working with social logins and emails with non deployed smart accounts.
		// If this is needed then use:
		// const client = createPublicClient({
		// 	transport: http(`https://rpc.walletconnect.org/v1/?chainId=${chainId}&projectId=${projectId}`)
		// });
		//
		// const isValid = await client.verifyMessage({
		// 	message,
		// 	address,
		// 	signature: signature as `0x${string}`
		// });
		
		const isValid = await verifySignature({
			address,
			message,
			signature,
			chainId,
			projectId: this.projectId
		});
		
		if (!isValid) {
			logger.warn(`${SERVICE} Invalid signature for address ${address}`);
			throw new Error(`${SERVICE} Invalid signature`);
		}
		
		logger.debug(`${SERVICE} SIWE signature verified for address ${address}`);
		return {
			address,
			chainId
		};
	}
}
