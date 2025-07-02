'use client';

import {useEffect} from 'react';
import {useSession} from 'next-auth/react';
import {useAppKitAccount, useDisconnect} from '@reown/appkit/react';

export default function SessionWatcher() {
	const {
		data: session,
		status
	} = useSession();
	const {status: walletStatus} = useAppKitAccount();
	const {disconnect} = useDisconnect();
	
	useEffect(() => {
			if (status !== 'authenticated') return;
			
			const handleLogout = async () => {
				if (session?.error === 'RefreshAccessTokenError' || (status === 'authenticated' && walletStatus === 'disconnected')) {
					console.warn('[SessionWatcher] RefreshAccessTokenError detected, logging out...');
					try {
						await disconnect();
					} catch (err) {
						console.error('[SessionWatcher] Disconnect failed:',
							err
						);
					}
				}
			};
			
			handleLogout();
		},
		[session?.error]
	);
	
	return null;
}
