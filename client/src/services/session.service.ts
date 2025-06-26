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
		// TODO: use ua-parser-js to send fingerprint data and store multiple session if user logs in on different devices
		// TODO: maybe save accesstoken to verify in backend if session is still valid
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
			refreshToken,
			accessTokenExpires
		} = data;
		
		return {
			accessToken,
			refreshToken,
			accessTokenExpires,
			chainId,
			userId: user.userId,
			address: user.address,
			role: user.role,
			name: user.name ?? null,
			email: user.email ?? null,
			picture: user.picture ?? null
		} satisfies User;
	} catch (err) {
		console.error('[verifySIWEAuth] Exception:',
			err
		);
		return null;
	}
}

export async function fetchUserSessionsData(): Promise<any[] | null> {
	try {
		const res = await fetch('/api/session/all',
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
		
		if (!res.ok) {
			return null;
		}
		
		const {data} = await res.json();
		
		if (!Array.isArray(data) || data.length === 0) {
			return null;
		}
		
		return data;
	} catch (err) {
		return null;
	}
}