export async function fetchUserProfileData(apiFetch: typeof fetch): Promise<any | null> {
	try {
		const res = await apiFetch('/api/user/me',
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
		
		if (!res.ok) return null;
		
		const {data} = await res.json();
		return data;
	} catch (err) {
		return null;
	}
}

export async function updateUserProfile(
	apiFetch: typeof fetch,
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
		const res = await apiFetch('/api/user/update',
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
		
		if (!res.ok) return false;
		
		await updateFn({
			user: {
				email,
				name,
				picture
			}
		});
		
		return true;
	} catch (err) {
		return false;
	}
}
