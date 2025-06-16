import {
	type SIWEVerifyMessageArgs,
	type SIWECreateMessageArgs,
	createSIWEConfig,
	formatMessage
} from '@reown/appkit-siwe';
import {WagmiAdapter} from '@reown/appkit-adapter-wagmi';
import {getCsrfToken, getSession, signIn, signOut} from 'next-auth/react';

import {arbitrum, mainnet, sepolia, optimism, AppKitNetwork} from '@reown/appkit/networks';
import {getAddress} from 'viem';
import {Session} from 'next-auth';

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) throw new Error('Project ID is not defined');

export const metadata = {
	name: 'Appkit SIWE Example',
	description: 'Appkit Siwe Example - Next.js',
	url: process.env.DOMAIN || 'http://localhost:3000', // origin must match your domain & subdomain
	icons: ['https://avatars.githubusercontent.com/u/179229932']
};

// Create wagmiConfig
export const chains: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet,
	optimism,
	arbitrum,
	sepolia];

// Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
	networks: chains,
	projectId,
	ssr: true
});

// Normalize the address (checksum)
const normalizeAddress = (address: string): string => {
	try {
		const splitAddress = address.split(':');
		const extractedAddress = splitAddress[splitAddress.length - 1];
		const checksumAddress = getAddress(extractedAddress);
		splitAddress[splitAddress.length - 1] = checksumAddress;
		const normalizedAddress = splitAddress.join(':');
		
		return normalizedAddress;
	} catch (error) {
		return address;
	}
};

export const siweConfig = createSIWEConfig({
	getMessageParams: async () => ({
		domain: typeof window !== 'undefined' ? window.location.host : '',
		uri: typeof window !== 'undefined' ? window.location.origin : '',
		chains: chains.map((chain: AppKitNetwork) => parseInt(chain.id.toString())),
		statement: 'Please sign with your account'
	}),
	createMessage: ({
		address,
		...args
	}: SIWECreateMessageArgs) =>
		formatMessage(args,
			normalizeAddress(address)
		),
	getNonce: async () => {
		const nonce = await getCsrfToken();
		if (!nonce) {
			throw new Error('Failed to get nonce!');
		}
		
		return nonce;
	},
	getSession: async (): Promise<Session | null> => {
		const session = await getSession();
		if (!session) {
			return null;
		}
		
		// Validate address and chainId types
		if (typeof session.address !== 'string' || typeof session.chainId !== 'number') {
			return null;
		}
		
		if (session.error === 'RefreshAccessTokenError') {
			await signOut({
				redirect: true,
				redirectTo: '/'
			});
			return null;
		}
		return {
			...session,
			address: session.address,
			chainId: session.chainId
		};
	},
	verifyMessage: async ({
		message,
		signature
	}: SIWEVerifyMessageArgs) => {
		try {
			const success = await signIn('credentials',
				{
					message,
					redirect: false,
					signature,
					redirectTo: '/profile'
				}
			);
			
			return Boolean(success?.ok);
		} catch (error) {
			return false;
		}
	},
	onSignIn: async (session) => {
		if (session) {
			window.location.href = '/profile';
		}
	},
	signOut: async () => {
		try {
			const session = await getSession();
			if (session?.user.accessToken) {
				await fetch('http://localhost:3001/api/auth/logout',
					{
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${session?.user.accessToken}`,
							'Content-Type': 'application/json'
						}
					}
				);
			}
			
			await signOut();
			window.location.href = '/';
			return true;
		} catch (error) {
			return false;
		}
	},
	signOutOnDisconnect: true,
	signOutOnNetworkChange: true,
	signOutOnAccountChange: true
});
