'use client';

import {useEffect, useState} from 'react';
import {fetchUserProfileData} from '@/services/user.service';
import {UserData} from '@/types/user';
import {UserInfoList} from '@/components/data/user-info-list';
import {LoaderIndicator} from '@/components/loading/component-loader';
import {useApiFetch} from '@/lib/api-fetch';
import {toast} from 'sonner';

export function BackendDataColumn({refreshTrigger}: { refreshTrigger: number }) {
	const apiFetch = useApiFetch();
	const [data, setData] = useState<UserData | null>(null);
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	
	useEffect(() => {
			const fetchData = async () => {
				try {
					const profile = await fetchUserProfileData(apiFetch,
						(msg) => {
							setErrorMessage(msg); // UI feedback
							toast.error(msg);     // toast
						}
					);
					
					if (profile && profile.user && profile.chainId) {
						setData({
							...profile.user,
							chainId: profile.chainId
						});
						setErrorMessage(null); // reset
					} else if (!errorMessage) {
						const fallback = 'Incomplete profile data';
						setErrorMessage(fallback);
						toast.error(fallback);
					}
				} catch (err) {
					console.error('[Fetch user profile]',
						err
					);
					const fallback = 'Unexpected error occurred while loading profile';
					setErrorMessage(fallback);
					toast.error(fallback);
				} finally {
					setLoading(false);
				}
			};
			
			fetchData();
		},
		[refreshTrigger]
	);
	
	return (
		<div>
			<h2 className="font-bold mb-2">Backend Data</h2>
			{loading ? (
				<LoaderIndicator label="Loading backend data..."/>
			) : errorMessage ? (
				<p>{errorMessage}</p>
			) : !data ? (
				<p>No profile data available.</p>
			) : (
				<UserInfoList data={data}/>
			)}
		</div>
	);
}
