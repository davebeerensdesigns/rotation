import './globals.css';
import type {Metadata} from 'next';
import {headers} from 'next/headers';

import {cookieToInitialState} from 'wagmi';

import {wagmiAdapter} from '@/config';
import AppKitProvider from '@/context';
import styles from '@/app/page.module.css';

export default async function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	const cookiesObject = await headers();
	const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig,
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
