import {
	createSIWEConfig,
	formatMessage,
	type SIWECreateMessageArgs,
	SIWESession,
	type SIWEVerifyMessageArgs
} from '@reown/appkit-siwe';
import {WagmiAdapter} from '@reown/appkit-adapter-wagmi';
import {getSession, signIn, signOut} from 'next-auth/react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import {AppKitNetwork, arbitrum, mainnet, optimism} from '@reown/appkit/networks';
import {getAddress} from 'viem';

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) throw new Error('Project ID is not defined');

export const metadata = {
	name: 'Appkit SIWE Example',
	description: 'Appkit Siwe Example - Next.js',
	url: process.env.DOMAIN || 'http://localhost:3000',
	icons: ['https://avatars.githubusercontent.com/u/179229932']
};

export const chains = [
	mainnet,
	arbitrum,
	optimism
] as [
	AppKitNetwork,
	...AppKitNetwork[]
];

export const chainLogos: Record<number, string> = {
	1: '/chain-logo/ethereum-eth-logo.svg',
	10: '/chain-logo/optimism-ethereum-op-logo.svg',
	42161: '/chain-logo/arbitrum-arb-logo.svg'
};

export const wagmiAdapter = new WagmiAdapter({
	networks: chains,
	projectId,
	ssr: true
});

const normalizeAddress = (address: string): string => {
	try {
		const splitAddress = address.split(':');
		const extractedAddress = splitAddress[splitAddress.length - 1];
		splitAddress[splitAddress.length - 1] = getAddress(extractedAddress);
		return splitAddress.join(':');
	} catch (error) {
		return address;
	}
};

let isLoggingOut = false;

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
		const res = await fetch('http://localhost:3001/api/session/nonce',
			{
				method: 'GET',
				credentials: 'include'
			}
		);
		if (!res.ok) throw new Error('Network response was not ok');
		return await res.text();
	},
	getSession: async (): Promise<SIWESession | null> => {
		const session = await getSession();
		if (!session) return null;
		
		if (typeof session.address !== 'string' || typeof session.chainId !== 'number') {
			return null;
		}
		
		if (session.error === 'RefreshAccessTokenError') {
			return null;
		}
		
		return {
			address: session.address,
			chainId: session.chainId
		};
	},
	verifyMessage: async ({
		message,
		signature
	}: SIWEVerifyMessageArgs): Promise<boolean> => {
		
		try {
			const fp = await FingerprintJS.load();
			const {visitorId} = await fp.get();
			
			const success = await signIn('credentials',
				{
					message,
					redirect: false,
					signature,
					userAgent: navigator.userAgent,
					visitorId
				}
			);
			return Boolean(success?.ok);
		} catch {
			return false;
		}
	},
	onSignIn: (session?: SIWESession): void => {
		if (session) {
			window.location.reload();
		}
	},
	signOut: async (): Promise<boolean> => {
		if (isLoggingOut) return false;
		isLoggingOut = true;
		
		const session = await getSession();
		if (session) {
			try {
				await signOut({
					redirect: true,
					redirectTo: '/'
				});
				return true;
			} catch {
				return false;
			}
		}
		
		return true;
	},
	signOutOnDisconnect: true,
	signOutOnNetworkChange: true,
	signOutOnAccountChange: true
});
