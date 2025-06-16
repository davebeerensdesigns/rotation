import type {NextAuthConfig, User} from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import {getAddressFromMessage, getChainIdFromMessage} from '@reown/appkit-siwe';
import {createPublicClient, http} from 'viem';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
	throw new Error('NEXT_PUBLIC_PROJECT_ID is not set');
}

export default {
	providers: [
		Credentials({
			name: 'Ethereum',
			credentials: {
				message: {
					label: 'Message',
					type: 'text',
					placeholder: '0x0'
				},
				signature: {
					label: 'Signature',
					type: 'text',
					placeholder: '0x0'
				}
			},
			async authorize(credentials) {
				try {
					if (!credentials?.message) {
						throw new Error('SIWE message is undefined');
					}
					
					const message = credentials.message as string;
					const signature = credentials.signature as string;
					
					const address = getAddressFromMessage(message);
					const chainId = getChainIdFromMessage(message);
					
					// Gebruik viem voor handtekeningverificatie
					const publicClient = createPublicClient({
						transport: http(
							`https://rpc.walletconnect.org/v1/?chainId=${chainId}&projectId=${projectId}`
						)
					});
					
					const isValid = await publicClient.verifyMessage({
						message,
						address: address as `0x${string}`,
						signature: signature as `0x${string}`
					});
					
					if (!isValid) {
						console.warn('[Authorize] Signature is not valid for address:',
							address
						);
						return null;
					}
					
					const res = await fetch('http://localhost:3001/api/auth/siwe-sync',
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								wallet: address,
								chainId
							})
						}
					);
					
					if (!res.ok) {
						console.error('[Authorize] Sync API request failed with status:',
							res.status
						);
						return null;
					}
					
					const {data} = await res.json();
					const {
						user,
						accessToken,
						refreshToken,
						accessTokenExpires
					} = data || {};
					
					if (!user || !user.wallet || !user.chainId) {
						console.error('[Authorize] Missing user info in response:',
							data
						);
						return null;
					}
					
					return {
						id: `${user.chainId}:${user.wallet}`,
						accessToken,
						refreshToken,
						accessTokenExpires,
						userId: user.userId,
						wallet: user.wallet,
						chainId: user.chainId,
						role: user.role,
						name: user.name ?? null,
						email: user.email ?? null,
						picture: user.picture ?? null
					} satisfies User;
					
				} catch (error) {
					console.error('[Authorize] Unexpected error:',
						error
					);
					return null;
				}
			}
		})
	]
} satisfies NextAuthConfig;