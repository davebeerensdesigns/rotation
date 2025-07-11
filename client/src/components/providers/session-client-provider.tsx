'use client';

import {SessionProvider} from 'next-auth/react';
import {ReactNode} from 'react';
import {Session} from 'next-auth';
import SessionWatcher from '@/components/providers/session-watcher';

export default function SessionClientProvider({
	children,
	session
}: {
	children: ReactNode;
	session: Session | null
}) {
	return (
		<SessionProvider session={session} refetchInterval={120}>
			<SessionWatcher/>
			{children}
		</SessionProvider>
	);
}
