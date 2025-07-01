'use client';

import {JSX, useEffect, useState} from 'react';
import {useSession} from 'next-auth/react';
import {UAParser} from 'ua-parser-js';
import {fetchUserSessionsData} from '@/services/session.service';
import {LoaderIndicator} from '@/components/loading/component-loader';
import {UserSession} from '@/types/user';

export default function ProfileSettings(): JSX.Element {
	const {
		data: session,
		status
	} = useSession();
	const [sessionsData, setSessionsData] = useState<UserSession[] | null>(null);
	const [loading, setLoading] = useState(true);
	
	useEffect(() => {
			if (status !== 'authenticated') return;
			
			const fetchData = async () => {
				try {
					const sessions = await fetchUserSessionsData();
					if (sessions) setSessionsData(sessions);
				} catch (e) {
					console.error('[Fetch user sessions]',
						e
					);
				} finally {
					setLoading(false);
				}
			};
			
			fetchData();
		},
		[status]
	);
	
	const parseUserAgent = (ua: string) => {
		const parser = new UAParser(ua);
		const browser = parser.getBrowser();
		const os = parser.getOS();
		const device = parser.getDevice();
		
		return {
			browser: `${browser.name ?? 'Unknown'} ${browser.version ?? ''}`,
			os: `${os.name ?? 'Unknown'} ${os.version ?? ''}`,
			device: device.model
				? `${device.vendor ?? ''} ${device.model}`
				: 'Desktop / Unknown Device'
		};
	};
	
	return (
		<>
			<h1 className="my-6 text-3xl sm:text-xl md:text-2xl md:leading-[1.2] font-bold">
				Settings
			</h1>
			<div className="space-y-4">
				{status === 'loading' || loading ? (
					<LoaderIndicator label="Loading sessions..."/>
				) : status === 'unauthenticated' || !session ? (
					<p>You are not logged in.</p>
				) : !sessionsData ? (
					<p>Could not load session data.</p>
				) : (
					sessionsData.map((session) => {
						const parsed = parseUserAgent(session.userAgent);
						return (
							<div
								key={session.sessionId}
								className="border p-4 rounded-xl shadow-sm bg-white dark:bg-slate-900"
							>
								<div><strong>Device:</strong> {parsed.device}</div>
								<div><strong>OS:</strong> {parsed.os}</div>
								<div><strong>Browser:</strong> {parsed.browser}</div>
								<div><strong>Visitor ID:</strong> {session.visitorId}</div>
								<div><strong>Session ID:</strong> {session.sessionId}</div>
								<div><strong>Created:</strong> {new Date(session.createdAt).toLocaleString()}</div>
							</div>
						);
					})
				)}
			</div>
		</>
	);
}


