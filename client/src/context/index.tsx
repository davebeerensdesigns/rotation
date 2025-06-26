'use client';

import React, {JSX, ReactNode} from 'react';
import {wagmiAdapter, projectId, siweConfig, metadata, chains, chainLogos} from '@/config';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {State, WagmiProvider} from 'wagmi';
import {
	createAppKit
} from '@reown/appkit/react';

// Initialize a singleton QueryClient for React Query caching
const queryClient = new QueryClient();

if (!projectId) {
	throw new Error('Project ID is not defined');
}

/**
 * Initializes the Reown AppKit modal and configuration.
 *
 * This sets up network support, SIWE integration, and disables optional features like swaps and onramps.
 * Must be called once before rendering any AppKit-powered components.
 */
createAppKit({
	themeMode: 'light',
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

/**
 * Wraps the application with Wagmi and React Query providers,
 * enabling Reown AppKit functionality and Ethereum wallet connection management.
 *
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - React children to render inside the provider.
 * @param {State} [props.initialState] - Optional initial Wagmi state, useful for hydration on SSR.
 * @returns {JSX.Element} The wrapped application content.
 */
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