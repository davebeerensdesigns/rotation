'use client';

import {useEffect} from 'react';
import {signOut, useSession} from 'next-auth/react';
import {useDisconnect} from '@reown/appkit/react';

export default function SessionWatcher() {
	const {
		data: session,
		status
	} = useSession();
	const {disconnect} = useDisconnect();
	useEffect(() => {
			if (status !== 'authenticated') return;
			
			console.log('[SESSION WATCHER STARTED]');
			
			const logoutIfInvalid = async () => {
				if (session?.error === 'RefreshAccessTokenError') {
					console.warn('[SESSION INVALID] RefreshAccessTokenError from useSession');
					await disconnect();
					await signOut({
						redirect: true,
						redirectTo: window.location.origin
					});
				}
			};
			
			logoutIfInvalid();
			
			const interval = setInterval(async () => {
					try {
						const res = await fetch('/api/auth/session');
						const json = await res.json();
						
						console.log('[SESSION CHECK]',
							res.status,
							json
						);
						
						if (res.status === 401 || json?.error === 'RefreshAccessTokenError') {
							console.warn('[SESSION INVALID] Token expired or refresh failed');
							
							await disconnect();
							await signOut({
								redirect: true,
								redirectTo: window.location.origin
							});
						}
					} catch (e) {
						console.error('[SESSION CHECK FAILED]',
							e
						);
					}
				},
				120_000
			);
			
			return () => {
				clearInterval(interval);
				console.log('[SESSION WATCHER STOPPED]');
			};
		},
		[status,
			session]
	);
	
	return null;
}
