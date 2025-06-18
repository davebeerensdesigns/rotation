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
					let chainId = getChainIdFromMessage(message);
					
					try {
						const res = await fetch('http://localhost:3001/api/auth/verify',
							{
								method: 'POST',
								headers: {
									'Accept': 'application/json',
									'Content-Type': 'application/json'
								},
								mode: 'cors',
								body: JSON.stringify({
									message,
									signature
								}),
								credentials: 'include'
							}
						);
						// if (!response.ok) {
						// 	return null;
						// }
						// const res = await fetch('http://localhost:3001/api/auth/siwe-sync',
						// 	{
						// 		method: 'POST',
						// 		headers: {
						// 			'Content-Type': 'application/json'
						// 		},
						// 		body: JSON.stringify({
						// 			address,
						// 			chainId
						// 		})
						// 	}
						// );
						
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
						
						if (!user) {
							console.error('[Authorize] Missing user info in response:',
								data
							);
							return null;
						}
						
						return {
							id: `${chainId}:${address}`,
							accessToken,
							refreshToken,
							accessTokenExpires,
							userId: user.userId,
							address: user.address,
							chainId: user.chainId,
							role: user.role,
							name: user.name ?? null,
							email: user.email ?? null,
							picture: user.picture ?? null
						} satisfies User;
					} catch (error) {
						return null;
					}
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