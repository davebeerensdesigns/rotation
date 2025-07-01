import '@/styles/globals.css';
import {headers} from 'next/headers';
import {cookieToInitialState} from 'wagmi';
import {wagmiAdapter} from '@/config';
import AppKitProvider from '@/context';
import {JSX} from 'react';
import {Geist} from 'next/font/google';
import {ThemeProvider} from '@/components/providers/theme-provider';
import SessionClientProvider from '@/components/providers/session-client-provider';
import {auth} from '@/auth';
import {NavbarShell} from '@/components/navbar/navbar-shell';

const geistSans = Geist({
	subsets: ['latin']
});

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
	const session = await auth();
	
	return (
		<html lang="en" suppressHydrationWarning>
		<body className={`${geistSans.className} antialiased`}>
		<SessionClientProvider session={session}>
			<AppKitProvider initialState={initialState}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					<NavbarShell/>
					<main className="pt-16 xs:pt-20 sm:pt-24 max-w-screen-xl mx-auto">
						{children}
					</main>
				</ThemeProvider>
			</AppKitProvider>
		</SessionClientProvider>
		</body>
		</html>
	);
}
