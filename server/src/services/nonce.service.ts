import MongoDatabase from '../db';
import {generateNonce} from 'siwe';
import {SessionUtils} from '../utils/session.utils';
import {logger} from '../utils/logger.utils';

const SERVICE = '[NonceService]';
const sessionUtils = SessionUtils.getInstance();

export class NonceService {
	private static instance: NonceService;
	
	private constructor() {}
	
	public static getInstance(): NonceService {
		if (!NonceService.instance) {
			NonceService.instance = new NonceService();
		}
		return NonceService.instance;
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
	
	public async validateAndRemoveNonce({
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
}
