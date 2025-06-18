import './globals.css';
import {headers} from 'next/headers';
import {cookieToInitialState} from 'wagmi';

import {wagmiAdapter} from '@/config';
import AppKitProvider from '@/context';
import styles from '@/app/page.module.css';
import {JSX} from 'react';

/**
 * Root layout for the entire application.
 *
 * This layout wraps all pages with the necessary providers and global styles.
 * It initializes the Wagmi state from cookies and sets up the AppKitProvider,
 * which enables Web3 features like wallet connections across the app.
 *
 * @param {Readonly<{ children: React.ReactNode }>} props - The layout's children.
 * @returns {JSX.Element} The full HTML structure with AppKit context and global layout.
 */
export default async function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>): Promise<JSX.Element> {
	const cookiesObject = await headers();
	const initialState = cookieToInitialState(
		wagmiAdapter.wagmiConfig,
		cookiesObject.get('cookie')
	);
	
	return (
		<html lang="en">
		<body>
		<AppKitProvider initialState={initialState}>
			<main className={styles.main}>
				{children}
			</main>
		</AppKitProvider>
		</body>
		</html>
	);
}
