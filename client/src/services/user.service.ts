export async function fetchUserProfileData(): Promise<any | null> {
	try {
		const res = await fetch('/api/user/me',
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
		
		if (!res.ok) {
			console.error('[SERVICE] Failed to fetch user profile',
				res.status
			);
			return null;
		}
		
		const {data} = await res.json();
		return data.user;
	} catch (err) {
		console.error('[SERVICE] Error fetching user profile',
			err
		);
		return null;
	}
}

export async function updateUserProfile(
	updateFn: (data: any) => Promise<any>,
	{
		email,
		name,
		picture
	}: {
		email: string;
		name: string;
		picture: string;
	}
): Promise<boolean> {
	try {
		const res = await fetch('/api/user/update',
			{
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email,
					name,
					picture
				})
			}
		);
		
		if (!res.ok) {
			console.error('[updateUserProfile] Server responded with',
				res.status
			);
			return false;
		}
		
		await updateFn({
			user: {
				email,
				name
			}
		});
		
		console.log('[updateUserProfile] User updated in DB and session');
		return true;
	} catch (err) {
		console.error('[updateUserProfile] Error:',
			err
		);
		return false;
	}
}