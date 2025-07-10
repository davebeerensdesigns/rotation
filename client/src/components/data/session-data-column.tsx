'use client';

import {useSession} from 'next-auth/react';
import {UserInfoList} from '@/components/data/user-info-list';
import {LoaderIndicator} from '@/components/loading/component-loader';

export function SessionDataColumn() {
	const {
		data: session,
		status
	} = useSession();
	
	if (status === 'loading') return <LoaderIndicator label="Loading session..."/>;
	if (!session) return <p>You are not logged in.</p>;
	
	return (
		<div>
			<h2 className="font-bold mb-2">Session Data</h2>
			<UserInfoList data={session.user}/>
		</div>
	);
}