'use client';

import {useEffect, useState} from 'react';
import {fetchUserProfileData} from '@/services/user.service';
import {UserData} from '@/types/user';
import {UserInfoList} from '@/components/data/user-info-list';
import {LoaderIndicator} from '@/components/loading/component-loader';
import {useApiFetch} from '@/lib/api-fetch';

export function BackendDataColumn({refreshTrigger}: { refreshTrigger: number }) {
	const apiFetch = useApiFetch();
	const [data, setData] = useState<UserData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	
	useEffect(() => {
			const fetchData = async () => {
				setLoading(true);
				try {
					const data = await fetchUserProfileData(apiFetch);
					
					if (data && data.user && data.chainId) {
						setData({
							...data.user,
							...data.chainId
						});
						setError(null);
					} else {
						setError('Incomplete data');
					}
				} catch (err) {
					console.error('[Fetch error]',
						err
					);
					setError('Could not load backend data');
				} finally {
					setLoading(false);
				}
			};
			
			fetchData();
		},
		[refreshTrigger]
	);
	
	if (loading) return <LoaderIndicator label="Loading backend data..."/>;
	if (error) return <p className="text-red-500">{error}</p>;
	
	return (
		<div>
			<h2 className="font-bold mb-2">Backend Data</h2>
			<UserInfoList data={data!}/>
		</div>
	);
}