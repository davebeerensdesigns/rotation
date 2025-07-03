'use client';

import {useEffect, useCallback, useRef} from 'react';
import {useSession} from 'next-auth/react';
import {
	useAppKitAccount,
	useDisconnect
} from '@reown/appkit/react';

export default function SessionWatcher() {
	const {
		data: session,
		status: authStatus
	} = useSession();
	const {
		status: walletStatus
	} = useAppKitAccount();
	const {disconnect} = useDisconnect();
	
	// ✅ Prevent repeated logout triggers
	const hasLoggedOutRef = useRef(false);
	
	// Unified logout logic
	const handleLogout = useCallback(async () => {
			if (hasLoggedOutRef.current) return;
			hasLoggedOutRef.current = true;
			
			try {
				console.warn('[SessionWatcher] Triggering logout via disconnect()...');
				await disconnect();
			} catch (err) {
				console.error('[SessionWatcher] Disconnect failed:',
					err
				);
			}
		},
		[disconnect]
	);
	
	useEffect(() => {
			if (authStatus !== 'authenticated') return;
			
			// Case 1: Token refresh error (session invalid)
			if (session?.error === 'RefreshAccessTokenError') {
				console.warn('[SessionWatcher] RefreshAccessTokenError detected in session');
				handleLogout();
				return;
			}
			
			// Case 2: Wallet manually disconnected
			if (walletStatus === 'disconnected') {
				console.warn('[SessionWatcher] Wallet disconnected while authenticated');
				handleLogout();
				return;
			}
		},
		[authStatus,
			session?.error,
			walletStatus,
			handleLogout]
	);
	
	return null;
}
