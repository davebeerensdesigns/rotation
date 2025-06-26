import {JSX} from 'react';
import {Navbar} from '@/components/navbar';

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
		<>
			<Navbar/>
			<main className="pt-16 xs:pt-20 sm:pt-24 max-w-screen-xl mx-auto">
				<h1 className="my-6 text-3xl sm:text-xl md:text-2xl md:leading-[1.2] font-bold">
					Homepage
				</h1>
			</main>
		</>
	);
}
