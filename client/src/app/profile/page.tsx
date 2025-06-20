'use client';

import {JSX, useEffect, useState} from 'react';
import {useSession} from 'next-auth/react';
import {Navbar} from '@/components/navbar';
import {Button} from '@/components/ui/button';
import {updateUserProfile} from '@/services/user.service';
import {Loader} from 'lucide-react';

/**
 * React component for fetching and displaying the user's profile.
 *
 * - Uses `useSession()` from next-auth to retrieve session.
 * - If a valid access token is found, it calls the `/api/auth/session` endpoint.
 * - Displays session and user details if authenticated.
 *
 * @returns {JSX.Element} The user profile view or fallback UI based on authentication status.
 */
export default function FetchUserProfile(): JSX.Element {
	const {
		data: session,
		status,
		update
	} = useSession(); // replaces siweConfig.getSession()
	const [userData, setUserData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [userUpdateLoading, setUserUpdateLoading] = useState(false);
	
	useEffect(() => {
			
			const fetchUserData = async () => {
				if (!session) {
					setLoading(false);
					return;
				}
				
				try {
					const accessToken = session.user?.accessToken;
					if (!accessToken) {
						console.warn('[PROFILE] No accessToken found in session');
						setLoading(false);
						return;
					}
					
					const res = await fetch('http://localhost:3001/api/auth/session',
						{
							method: 'GET',
							headers: {
								Authorization: `Bearer ${accessToken}`
							}
						}
					);
					
					if (!res.ok) {
						console.error('[PROFILE] Server response error',
							res.status
						);
						setLoading(false);
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
			
			fetchUserData();
		},
		[session]
	);
	
	const handleClick = async () => {
		setUserUpdateLoading(true);
		
		const success = await updateUserProfile(update,
			{
				email: 'pietje2@piet.com',
				name: 'Pietje Puk2',
				picture: 'https://example.com/avatar2.jpg'
			}
		);
		
		if (success) {
			console.log('Update completed');
		}
		
		setUserUpdateLoading(false);
	};
	
	return (
		<>
			<Navbar/>
			<main className="pt-16 xs:pt-20 sm:pt-24">
				{status === 'loading' || loading ? (
					<p>Loading profile...</p>
				) : status === 'unauthenticated' || !session ? (
					<p>You are not logged in.</p>
				) : !userData ? (
					<p>Could not load profile data.</p>
				) : (
					<>
						<div className="mb-4">
							<p><strong>Address:</strong> {userData.address}</p>
							<p><strong>Chain ID:</strong> {userData.chainId}</p>
							<p><strong>Email:</strong> {userData.email}</p>
							<p><strong>Name:</strong> {userData.name}</p>
							<p><strong>Image:</strong> {userData.picture}</p>
							<p><strong>User ID:</strong> {userData.userId}</p>
							<p><strong>Role:</strong> {userData.role}</p>
						</div>
						
						<Button onClick={handleClick} disabled={userUpdateLoading}>
							{userUpdateLoading ? (
								<>
									<Loader className="h-4 w-4 animate-spin"/>
									Update profile
								</>
							) : (
								'Update profile'
							)}
						</Button>
					</>
				)}
			</main>
		</>
	);
}
