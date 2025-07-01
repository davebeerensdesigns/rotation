'use client';

import {useEffect, useState} from 'react';
import {fetchUserProfileData} from '@/services/user.service';
import {UserData} from '@/types/user';
import {UserInfoList} from '@/components/data/user-info-list';
import {LoaderIndicator} from '@/components/loading/component-loader';

export function BackendDataColumn({refreshTrigger}: { refreshTrigger: number }) {
	const [data, setData] = useState<UserData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	
	useEffect(() => {
			const fetchData = async () => {
				setLoading(true);
				try {
					const {
						user,
						chainId
					} = await fetchUserProfileData();
					if (user && chainId) {
						setData({
							...user,
							chainId
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