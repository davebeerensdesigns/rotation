import '@/styles/globals.css';
import {headers} from 'next/headers';
import {cookieToInitialState} from 'wagmi';
import {wagmiAdapter} from '@/config';
import AppKitProvider from '@/context';
import {JSX} from 'react';
import {Geist} from 'next/font/google';
import {ThemeProvider} from '@/components/providers/theme-provider';
import {SessionProvider} from 'next-auth/react';

const geistSans = Geist({
	subsets: ['latin']
});

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
		<html lang="en" suppressHydrationWarning>
		<body className={`${geistSans.className} antialiased`}>
		<SessionProvider>
			<AppKitProvider initialState={initialState}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					{children}
				</ThemeProvider>
			</AppKitProvider>
		</SessionProvider>
		</body>
		</html>
	);
}
