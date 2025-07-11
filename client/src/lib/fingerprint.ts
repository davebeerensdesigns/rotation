import FingerprintJS from '@fingerprintjs/fingerprintjs';

let cachedVisitorId: string | null = null;

export async function getVisitorId(): Promise<string> {
	if (cachedVisitorId) return cachedVisitorId;
	
	const fp = await FingerprintJS.load();
	const {visitorId} = await fp.get();
	
	cachedVisitorId = visitorId;
	return visitorId;
}