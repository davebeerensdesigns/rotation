import type {NextAuthConfig, User} from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import {verifySIWEAuth} from '@/services/session.service';

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
