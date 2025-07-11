'use client';

import {useEffect} from 'react';
import {useSession, signOut} from 'next-auth/react';
import {useRouter} from 'next/navigation';

export default function SessionWatcher() {
	const {
		data: session
	} = useSession();
	const router = useRouter();
	// Unified logout logic
	const handleLogout = async () => {
		try {
			console.warn('[SessionWatcher] Triggering logout via disconnect()...');
			await signOut({
				redirect: false
			});
		} catch (err) {
			console.error('[SessionWatcher] Disconnect failed:',
				err
			);
		}
	};
	
	useEffect(() => {
			if (session?.error === 'RefreshAccessTokenError') {
				console.warn('[SessionWatcher] RefreshAccessTokenError detected in session');
				handleLogout()
					.then(() => {
						router.push('/');
					});
				return;
			}
		},
		[session?.error,
			router]
	);
	
	return null;
}
