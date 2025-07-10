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
import {setNextToast} from '@/lib/toast-message';

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) throw new Error('Project ID is not defined');

const domainUrl = process.env.NEXT_PUBLIC_DOMAIN;
if (!domainUrl) throw new Error('NEXT_PUBLIC_DOMAIN is not set');

export const metadata = {
	name: 'Appkit SIWE Example',
	description: 'Appkit Siwe Example - Next.js',
	url: domainUrl,
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
	getMessageParams: async () => {
		try {
			const res = await fetch('/api/siwe/message-params',
				{
					method: 'GET',
					headers: {'Accept': 'application/json'}
				}
			);
			
			if (!res.ok) return undefined;
			
			const data = await res.json();
			
			return {
				...data,
				chains: chains.map((chain) => parseInt(chain.id.toString(),
					10
				))
			};
		} catch {
			return undefined;
		}
	},
	createMessage: ({
		address,
		...args
	}: SIWECreateMessageArgs) =>
		formatMessage(args,
			normalizeAddress(address)
		),
	getNonce: async () => {
		const fp = await FingerprintJS.load();
		const {visitorId} = await fp.get();
		
		const res = await fetch('/api/siwe/nonce',
			{
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify({
					visitorId
				})
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
			let ipAddress: string | undefined;
			if (process.env.NODE_ENV === 'development') {
				const ipRes = await fetch('https://api.ipify.org?format=json');
				const ipData = await ipRes.json();
				ipAddress = ipData.ip;
			}
			
			const success = await signIn('credentials',
				{
					message,
					redirect: false,
					signature,
					userAgent: navigator.userAgent,
					visitorId,
					ipAddress
				}
			);
			return Boolean(success?.ok);
		} catch {
			return false;
		}
	},
	onSignIn: (session?: SIWESession): void => {
		if (session) {
			setNextToast('success',
				'Login',
				'Successfully logged in!'
			);
			window.location.reload();
		}
	},
	signOut: async (): Promise<boolean> => {
		if (isLoggingOut) return false;
		isLoggingOut = true;
		
		const session = await getSession();
		if (session) {
			try {
				if (session.error === 'RefreshAccessTokenError') {
					setNextToast('error',
						'Logout',
						'Your session has been revoked or expired. Please log in again.'
					);
					await signOut({
						redirect: true,
						redirectTo: '/'
					});
				} else {
					await signOut({
						redirect: false
					});
				}
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