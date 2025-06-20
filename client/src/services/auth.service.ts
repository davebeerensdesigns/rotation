import {User} from 'next-auth';

export async function verifySIWEAuth({
	message,
	signature
}: {
	message: string;
	signature: string;
}): Promise<User | null> {
	try {
		if (!message) {
			return null;
		}
		
		const res = await fetch('http://localhost:3001/api/auth/verify',
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
					signature
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
			accessToken,
			refreshToken,
			accessTokenExpires
		} = data;
		
		return {
			id: `${user.chainId}:${user.address}`,
			accessToken,
			refreshToken,
			accessTokenExpires,
			userId: user.userId,
			address: user.address,
			chainId: user.chainId,
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