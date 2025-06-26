'use client';

import {JSX, useEffect, useState} from 'react';
import {useSession} from 'next-auth/react';
import {Navbar} from '@/components/navbar';
import {UAParser} from 'ua-parser-js';
import {fetchUserSessionsData} from '@/services/session.service';

export default function ProfileSettings(): JSX.Element {
	const {
		data: session,
		status
	} = useSession();
	const [sessionsData, setSessionsData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	
	useEffect(() => {
			if (status !== 'authenticated') return;
			
			const fetchData = async () => {
				const sessions = await fetchUserSessionsData();
				
				if (sessions) setSessionsData(sessions);
				setLoading(false);
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
			<Navbar/>
			<main className="pt-16 xs:pt-20 sm:pt-24 max-w-screen-xl mx-auto">
				<h1 className="my-6 text-3xl sm:text-xl md:text-2xl md:leading-[1.2] font-bold">
					Settings
				</h1>
				<div>
					{status === 'loading' || loading ? (
						<p>Loading sessions...</p>
					) : status === 'unauthenticated' || !session ? (
						<p>You are not logged in.</p>
					) : !sessionsData ? (
						<p>Could not load sessions data.</p>
					) : (
						sessionsData.map((session: any) => {
							const parsed = parseUserAgent(session.userAgent);
							return (
								<div
									key={session.sessionId}
									className="border p-4 rounded-xl shadow-sm bg-white"
								>
									<div><strong>Device:</strong> {parsed.device}</div>
									<div><strong>OS:</strong> {parsed.os}</div>
									<div><strong>Browser:</strong> {parsed.browser}</div>
									<div><strong>Visitor ID:</strong> {session.visitorId}</div>
									<div><strong>Session ID:</strong> {session.sessionId}</div>
									<div><strong>Aangemaakt:</strong> {new Date(session.createdAt).toLocaleString()}
									</div>
								</div>
							);
						})
					)}
				</div>
			</main>
		</>
	);
}
