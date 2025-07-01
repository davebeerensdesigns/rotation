'use client';

import {SessionProvider} from 'next-auth/react';
import {ReactNode} from 'react';
import SessionWatcher from '@/components/providers/session-watcher';
import {Session} from 'next-auth';

export default function SessionClientProvider({
	children,
	session
}: {
	children: ReactNode;
	session: Session | null
}) {
	return (
		<SessionProvider session={session}>
			<SessionWatcher/>
			{children}
		</SessionProvider>
	);
}
