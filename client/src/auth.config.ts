import type {NextAuthConfig, User} from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import {verifySIWEAuth} from '@/services/session.service';

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
				},
				userAgent: {
					label: 'UserAgent',
					type: 'text',
					placeholder: ''
				},
				visitorId: {
					label: 'UserAgent',
					type: 'text',
					placeholder: ''
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
				if (
					typeof credentials?.message !== 'string' ||
					typeof credentials?.signature !== 'string' ||
					typeof credentials?.userAgent !== 'string' ||
					typeof credentials?.visitorId !== 'string'
				) {
					return null;
				}
				return await verifySIWEAuth({
					message: credentials.message,
					signature: credentials.signature,
					userAgent: credentials.userAgent,
					visitorId: credentials.visitorId
				});
			}
		})
	]
} satisfies NextAuthConfig;
