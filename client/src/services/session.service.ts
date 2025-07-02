import {User} from 'next-auth';

export async function verifySIWEAuth({
	message,
	signature,
	userAgent,
	visitorId
}: {
	message: string;
	signature: string;
	userAgent: string;
	visitorId: string;
}): Promise<User | null> {
	try {
		if (!message) {
			return null;
		}
		
		const res = await fetch('http://localhost:3001/api/session/verify',
			{
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				mode: 'cors',
				credentials: 'include',
				body: JSON.stringify({
					message,
					signature,
					userAgent,
					visitorId
				})
			}
		);
		
		if (!res.ok) {
			return null;
		}
		
		const {data} = await res.json();
		
		if (!data?.user) {
			return null;
		}
		
		const {
			user,
			chainId,
			accessToken,
			accessTokenExpires,
			refreshToken,
			refreshTokenExpires
		} = data;
		
		return {
			accessToken,
			accessTokenExpires,
			refreshToken,
			refreshTokenExpires,
			chainId,
			userId: user.userId,
			address: user.address,
			role: user.role,
			name: user.name ?? null,
			email: user.email ?? null,
			picture: user.picture ?? null
		} satisfies User;
	} catch (err) {
		return null;
	}
}

export async function fetchUserSessionsData(
	apiFetch: typeof fetch,
	onError?: (msg: string) => void
): Promise<any[] | null> {
	try {
		const res = await apiFetch('/api/session/all',
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
		
		if (!res.ok) {
			onError?.('Failed to load sessions.');
			return null;
		}
		
		const {data} = await res.json();
		
		if (!Array.isArray(data) || data.length === 0) {
			onError?.('No active sessions found.');
			return null;
		}
		
		return data;
	} catch (err) {
		onError?.('Error while loading your sessions.');
		return null;
	}
}