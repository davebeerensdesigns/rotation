'use client';

import React, {JSX, ReactNode} from 'react';
import {wagmiAdapter, projectId, siweConfig, metadata, chains, chainLogos} from '@/config';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {State, WagmiProvider} from 'wagmi';
import {
	createAppKit, useAppKitAccount, useAppKitState, useWalletInfo
} from '@reown/appkit/react';

const queryClient = new QueryClient();

if (!projectId) {
	throw new Error('Project ID is not defined');
}

createAppKit({
	themeMode: 'dark',
	adapters: [wagmiAdapter],
	networks: chains,
	chainImages: chainLogos,
	projectId,
	siweConfig,
	metadata,
	features: {
		email: false,
		socials: [],
		emailShowWallets: false,
		analytics: false,
		swaps: false,
		onramp: false
	}
});

export default function AppKitProvider({
	children,
	initialState
}: {
	children: ReactNode;
	initialState?: State;
}): JSX.Element {
	return (
		<WagmiProvider config={wagmiAdapter.wagmiConfig} initialState={initialState}>
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		</WagmiProvider>
	);
}