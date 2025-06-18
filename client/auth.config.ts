import type {NextAuthConfig, User} from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import {getAddressFromMessage, getChainIdFromMessage} from '@reown/appkit-siwe';

/**
 * Environment variable required to configure WalletConnect RPC.
 * Throws an error at build-time if missing.
 */
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
	throw new Error('NEXT_PUBLIC_PROJECT_ID is not set');
}

/**
 * NextAuth configuration object using a custom SIWE (Sign-In With Ethereum) strategy.
 *
 * This config defines a custom `Credentials` provider that:
 * - Parses a SIWE message + signature
 * - Verifies the signature client-side
 * - Sends message + signature to a backend for validation and user sync
 * - Returns a custom user object with extended fields
 */
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
			
			/**
			 * Authorizes a user based on a signed SIWE message and its signature.
			 *
			 * This method:
			 * - Extracts and verifies the address and chainId from the SIWE message
			 * - Sends the message and signature to the backend (`/api/auth/verify`)
			 * - Returns a structured `User` object for NextAuth session and JWT usage
			 *
			 * @param {Record<string, unknown>} credentials - The form input containing message and signature.
			 * @returns {Promise<User | null>} The user object if verification succeeds, otherwise null.
			 */
			async authorize(credentials): Promise<User | null> {
				try {
					if (!credentials?.message) {
						throw new Error('SIWE message is undefined');
					}
					
					const message = credentials.message as string;
					const signature = credentials.signature as string;
					
					const address = getAddressFromMessage(message);
					const chainId = getChainIdFromMessage(message);
					
					try {
						const res = await fetch('http://localhost:3001/api/auth/verify',
							{
								method: 'POST',
								headers: {
									'Accept': 'application/json',
									'Content-Type': 'application/json'
								},
								mode: 'cors',
								credentials: 'include',
								body: JSON.stringify({
									message,
									signature
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
						
						if (!user) {
							console.error('[Authorize] Missing user info in response:',
								data
							);
							return null;
						}
						
						// Construct the full User object expected by the NextAuth `jwt` callback
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
						console.error('[Authorize] Internal fetch error:',
							error
						);
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
