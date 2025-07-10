'use client';

import {JSX, useEffect, useState} from 'react';
import {useSession} from 'next-auth/react';
import {UAParser} from 'ua-parser-js';
import {fetchUserSessionsData} from '@/services/session.service';
import {LoaderIndicator} from '@/components/loading/component-loader';
import {UserSession} from '@/types/user';
import {useApiFetch} from '@/lib/api-fetch';
import {toast} from 'sonner';
import {Badge} from '@/components/ui/badge';

export default function ProfileSettings(): JSX.Element {
	const {
		data: session,
		status
	} = useSession();
	const [sessionsData, setSessionsData] = useState<UserSession[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const apiFetch = useApiFetch();
	
	useEffect(() => {
			if (status !== 'authenticated' || !session) return;
			
			const fetchData = async () => {
				try {
					const sessions = await fetchUserSessionsData(apiFetch,
						(msg) => {
							setErrorMessage(msg); // store for UI
							toast.error(msg);     // trigger toast
						}
					);
					if (sessions) {
						setSessionsData(sessions);
						setErrorMessage(null); // clear previous error
					}
				} catch (e) {
					setErrorMessage('Unexpected error occurred while loading sessions.');
					toast.error('Unexpected error occurred while loading sessions.');
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
			device: device.model ? `${device.vendor ?? ''} ${device.model}` : 'Desktop / Unknown Device'
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
				) : errorMessage ? (
					<p>{errorMessage}</p>
				) : !sessionsData ? (
					<p>Could not load session data.</p>
				) : (
					sessionsData.map((
						session,
						index
					) => {
						const parsed = parseUserAgent(session.userAgent);
						
						return (
							<div
								key={index}
								className="relative border p-4 rounded-xl shadow-sm bg-white dark:bg-slate-900"
							>
								{session.isCurrent && (
									<div className="absolute top-2 right-2">
										<Badge>Current</Badge>
									</div>
								)}
								
								<div><strong>Device:</strong> {parsed.device}</div>
								<div><strong>OS:</strong> {parsed.os}</div>
								<div><strong>Browser:</strong> {parsed.browser}</div>
								<div><strong>ChainId:</strong> {session.chainId}</div>
								<div><strong>Ip address:</strong> {session.ipAddress}</div>
								<div><strong>Created:</strong> {new Date(session.createdAt).toLocaleString()}</div>
							</div>
						);
					})
				)}
			</div>
		</>
	);
}
