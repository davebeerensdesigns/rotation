'use client';

import {JSX} from 'react';

/**
 * WalletLogin component that renders the AppKit Web Component button.
 *
 * This component displays the `<appkit-button/>` Web Component used to initiate
 * wallet-based authentication via Reown AppKit.
 *
 * @returns {JSX.Element} A React element containing the AppKit login button.
 */
export const WalletLogin = (): JSX.Element => {
	return (
		<div>
			<appkit-button/>
		</div>
	);
};
