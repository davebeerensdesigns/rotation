import {WalletLogin} from '@/components/wallet-login';
import {JSX} from 'react';

/**
 * Home page component.
 *
 * Renders the WalletLogin component, which displays a Web3 wallet login button
 * using the Reown AppKit system.
 *
 * @returns {JSX.Element} The home page content with a wallet login option.
 */
export default function Home(): JSX.Element {
	return (
		<WalletLogin/>
	);
}
