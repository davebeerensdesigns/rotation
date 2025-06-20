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
				name,
				image: picture
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