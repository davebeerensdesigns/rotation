'use client';

import {JSX} from 'react';
import {WalletSheet} from '@/components/navbar/wallet-sheet';
import {NetworkSelectButton} from '@/components/network-select-button';
import {useSession} from 'next-auth/react';

/**
 * WalletLogin component that renders the AppKit Web Component button.
 *
 * This component displays the `<appkit-button/>` Web Component used to initiate
 * wallet-based authentication via Reown AppKit.
 *
 * @returns {JSX.Element} A React element containing the AppKit login button.
 */
export const WalletLogin = (): JSX.Element => {
	const {status} = useSession();
	if (status === 'authenticated') {
		return (
			<>
				<NetworkSelectButton/>
				<WalletSheet/>
			</>
		);
	} else {
		return (<appkit-connect-button size="sm" label="Connect login" loadingLabel="Loading..."/>);
	}
};
