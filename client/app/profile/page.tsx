'use client';
import {useEffect, useState} from 'react';
import {siweConfig} from '@/config';
import {Session} from 'next-auth';
import {WalletLogin} from '@/components/wallet-login';

export default function FetchUserProfile() {
	const [session, setSession] = useState<any>(null);
	const [userData, setUserData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	
	useEffect(() => {
			const fetchSessionAndUser = async () => {
				try {
					const sessionData = await siweConfig.getSession() as Session | null;
					if (!sessionData) {
						console.warn('[PROFILE] No valid session received');
						setLoading(false);
						return;
					}
					setSession(sessionData);
					
					const accessToken = sessionData.user?.accessToken;
					if (!accessToken) {
						console.warn('[PROFILE] No accessToken found in session');
						setLoading(false);
						return;
					}
					
					const res = await fetch('http://localhost:3001/api/auth/session',
						{
							method: 'GET',
							headers: {
								'Authorization': `Bearer ${sessionData.user.accessToken}`
							}
						}
					);
					
					if (!res.ok) {
						console.error('[PROFILE] Server response error',
							res.status
						);
						return;
					}
					
					const {data: json} = await res.json();
					setUserData(json.user);
				} catch (err) {
					console.error('[PROFILE] Error retrieving user',
						err
					);
				} finally {
					setLoading(false);
				}
			};
			
			fetchSessionAndUser();
		},
		[]
	);
	
	if (loading) return <p>Loading...</p>;
	if (!session) return <p>Not logged in</p>;
	if (!userData) return <p>Could not load user data</p>;
	
	return (
		<div>
			<div>
				<WalletLogin/>
			</div>
			<div>
				<p><strong>Address:</strong> {userData.address}</p>
				<p><strong>Chain ID:</strong> {userData.chainId}</p>
				<p><strong>Email:</strong> {userData.email}</p>
				<p><strong>Name:</strong> {userData.name}</p>
				<p><strong>Image:</strong> {userData.picture}</p>
				<p><strong>User ID:</strong> {userData.userId}</p>
				<p><strong>Role:</strong> {userData.role}</p>
			</div>
		</div>
	);
}
