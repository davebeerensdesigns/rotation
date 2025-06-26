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
import {AppKitNetwork, arbitrum, mainnet, optimism, ham} from '@reown/appkit/networks';
import {getAddress} from 'viem';

// ---------- CONFIG CONSTANTS ----------

/**
 * Your Reown Cloud project ID.
 * Must be set via environment variable `NEXT_PUBLIC_PROJECT_ID`.
 */
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) throw new Error('Project ID is not defined');

/**
 * Metadata used by AppKit modal and Reown Cloud.
 */
export const metadata = {
	name: 'Appkit SIWE Example',
	description: 'Appkit Siwe Example - Next.js',
	url: process.env.DOMAIN || 'http://localhost:3000', // must match your frontend domain
	icons: ['https://avatars.githubusercontent.com/u/179229932']
};

/**
 * Supported blockchain networks for wallet connection and SIWE authentication.
 */
export const chains = [mainnet,
	arbitrum,
	optimism,
	ham] as [
	AppKitNetwork,
	...AppKitNetwork[]
];

export const chainLogos: Record<number, string> = {
	1: '/chain-logo/ethereum-eth-logo.svg',
	10: '/chain-logo/optimism-ethereum-op-logo.svg',
	42161: '/chain-logo/arbitrum-arb-logo.svg'
};

/**
 * Adapter for connecting AppKit to Wagmi (Ethereum wallet client).
 */
export const wagmiAdapter = new WagmiAdapter({
	networks: chains,
	projectId,
	ssr: true
});

// ---------- HELPERS ----------

/**
 * Normalizes an Ethereum address to checksum format for use in SIWE.
 *
 * @param {string} address - The raw address string (possibly prefixed like 'eip155:...').
 * @returns {string} The normalized address string.
 */
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

// ---------- SIWE CONFIG ----------

/**
 * SIWE (Sign-In With Ethereum) configuration for Reown AppKit.
 * Includes custom message formatting, session management, and verification.
 */
export const siweConfig = createSIWEConfig({
	/**
	 * Provides parameters for creating a SIWE message.
	 */
	getMessageParams: async () => ({
		domain: typeof window !== 'undefined' ? window.location.host : '',
		uri: typeof window !== 'undefined' ? window.location.origin : '',
		chains: chains.map((chain: AppKitNetwork) => parseInt(chain.id.toString())),
		statement: 'Please sign with your account'
	}),
	
	/**
	 * Custom message formatter that normalizes the address.
	 */
	createMessage: ({
		address,
		...args
	}: SIWECreateMessageArgs) =>
		formatMessage(args,
			normalizeAddress(address)
		),
	
	/**
	 * Fetches a nonce from the backend Express API.
	 *
	 * @returns {Promise<string>} The nonce string.
	 */
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
	
	/**
	 * Retrieves the active NextAuth session from the frontend.
	 * Includes address + chain validation and refresh error handling.
	 *
	 * @returns {Promise<Session | null>}
	 */
	getSession: async (): Promise<SIWESession | null> => {
		const session = await getSession();
		if (!session) return null;
		
		if (typeof session.address !== 'string' || typeof session.chainId !== 'number') {
			return null;
		}
		
		if (session.error === 'RefreshAccessTokenError') {
			if (session?.user.accessToken) {
				await fetch('http://localhost:3001/api/session/logout',
					{
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${session?.user.accessToken}`,
							'Content-Type': 'application/json'
						}
					}
				);
			}
			await signOut({
				redirect: false
			});
			return null;
		}
		
		return {
			address: session.address,
			chainId: session.chainId
		};
	},
	
	/**
	 * Verifies the SIWE signature by forwarding it to the Express backend via NextAuth credentials provider.
	 *
	 * @param {SIWEVerifyMessageArgs} args - Contains the SIWE message and signature.
	 * @returns {Promise<boolean>} Whether the verification succeeded.
	 */
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
	
	/**
	 * Callback after a successful sign-in.
	 * Redirects to profile page by default.
	 *
	 * @param {SIWESession | undefined} session - The SIWE session object (subset of NextAuth session).
	 */
	onSignIn: (session?: SIWESession): void => {
		if (session) {
			window.location.reload();
		}
	},
	
	/**
	 * Signs out the user both from Express and NextAuth.
	 *
	 * @returns {Promise<boolean>} Whether the sign-out was successful.
	 */
	signOut: async (): Promise<boolean> => {
		try {
			const session = await getSession();
			if (session?.user.accessToken) {
				await fetch('http://localhost:3001/api/session/logout',
					{
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${session?.user.accessToken}`,
							'Content-Type': 'application/json'
						}
					}
				);
			}
			await signOut({
					redirect: false
				}
			);
			return true;
		} catch {
			return false;
		}
	},
	
	// Auto-sign out triggers
	signOutOnDisconnect: true,
	signOutOnNetworkChange: true,
	signOutOnAccountChange: true
});
