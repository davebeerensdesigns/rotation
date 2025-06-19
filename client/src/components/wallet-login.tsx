'use client';

import {JSX} from 'react';
import {useAppKitAccount} from '@reown/appkit-controllers/react';
import {shortenAddress} from '@/lib/utils';

/**
 * WalletLogin component that renders the AppKit Web Component button.
 *
 * This component displays the `<appkit-button/>` Web Component used to initiate
 * wallet-based authentication via Reown AppKit.
 *
 * @returns {JSX.Element} A React element containing the AppKit login button.
 */
export const WalletLogin = (): JSX.Element => {
	const {
		address,
		isConnected
	} = useAppKitAccount();
	return (
		<div>
			{!isConnected ? (
				<appkit-connect-button size="sm" label="Connect login" loadingLabel="Loading..."/>
			) : (
				<>
					<span>{shortenAddress(address)}</span>
				</>
			)}
		</div>
	);
};
