export async function fetchUserProfileData(
	apiFetch: typeof fetch,
	onError?: (msg: string) => void
): Promise<any | null> {
	try {
		const res = await apiFetch('/api/user/me',
			{
				method: 'GET'
			}
		);
		
		let json: any = null;
		
		try {
			json = await res.json();
		} catch (e) {
			const msg = 'Invalid JSON response.';
			onError?.(msg);
			return null;
		}
		
		if (!res.ok) {
			const msg = `HTTP ${res.status}: ${json?.message || res.statusText}`;
			onError?.(msg);
			return null;
		}
		
		if (json?.status !== 'success') {
			const msg = `API Error: ${json?.message || 'Unknown API error'}`;
			onError?.(msg);
			return null;
		}
		
		return json.data;
	} catch (err) {
		const msg = 'Unexpected error while loading profile.';
		onError?.(msg);
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
): Promise<void> {
	const res = await apiFetch('/api/user/update',
		{
			method: 'PATCH',
			body: JSON.stringify({
				email,
				name,
				picture
			})
		}
	);
	
	let json: any = null;
	
	try {
		json = await res.json();
	} catch (e) {
		throw new Error(`Invalid JSON response: ${e instanceof Error ? e.message : 'Unknown error'}`);
	}
	
	if (!res.ok) {
		throw new Error(`HTTP ${res.status}: ${json?.message || res.statusText}`);
	}
	
	if (json?.status !== 'success') {
		throw new Error(`API Error: ${json?.message || 'Unknown API error'}`);
	}
	
	await updateFn({
		user: {
			email,
			name,
			picture
		}
	});
}
