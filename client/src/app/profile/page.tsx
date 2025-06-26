'use client';

import {JSX, useEffect, useState} from 'react';
import {useSession} from 'next-auth/react';
import {Navbar} from '@/components/navbar';
import {Button} from '@/components/ui/button';
import {fetchUserProfileData, updateUserProfile} from '@/services/user.service';
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
	const [userSessionData, setUserSessionData] = useState<any>(null);
	const [userBackendData, setUserBackendData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [userUpdateLoading, setUserUpdateLoading] = useState(false);
	
	useEffect(() => {
			if (status !== 'authenticated') return;
			
			// Load user data from backend
			const fetchData = async () => {
				const {user} = await fetchUserProfileData();
				
				if (user) setUserBackendData(user);
				setLoading(false);
			};
			
			fetchData();
			
			// load user data from session
			setUserSessionData({
				...session.user,
				address: session.address,
				chainId: session.chainId
			});
			setLoading(false);
		},
		[status]
	);
	
	const handleClick = async () => {
		setUserUpdateLoading(true);
		
		await updateUserProfile(update,
			{
				email: 'pietje2@piet.com',
				name: 'Pietje Puk2',
				picture: 'avatar.jpg'
			}
		);
		
		setUserUpdateLoading(false);
	};
	
	return (
		<>
			<Navbar/>
			<main className="pt-16 xs:pt-20 sm:pt-24 max-w-screen-xl mx-auto">
				<h1 className="my-6 text-3xl sm:text-xl md:text-2xl md:leading-[1.2] font-bold">
					Profile
				</h1>
				{status === 'loading' || loading ? (
					<p>Loading profile...</p>
				) : status === 'unauthenticated' || !session ? (
					<p>You are not logged in.</p>
				) : !userSessionData ? (
					<p>Could not load user session data.</p>
				) : !userBackendData ? (
					<p>Could not load user backend data.</p>
				) : (
					<>
						<div className="mb-4">
							<h5>Session data</h5>
							<p><strong>Address:</strong> {userSessionData.address}</p>
							<p><strong>Chain ID:</strong> {userSessionData.chainId}</p>
							<p><strong>Email:</strong> {userSessionData.email}</p>
							<p><strong>Name:</strong> {userSessionData.name}</p>
							<p><strong>Image:</strong> {userSessionData.picture}</p>
							<p><strong>User ID:</strong> {userSessionData.userId}</p>
							<p><strong>Role:</strong> {userSessionData.role}</p>
						</div>
						<div className="mb-4">
							<h5>Backend data</h5>
							<p><strong>Address:</strong> {userBackendData.address}</p>
							<p><strong>Chain ID:</strong> {userBackendData.chainId}</p>
							<p><strong>Email:</strong> {userBackendData.email}</p>
							<p><strong>Name:</strong> {userBackendData.name}</p>
							<p><strong>Image:</strong> {userBackendData.picture}</p>
							<p><strong>User ID:</strong> {userBackendData.userId}</p>
							<p><strong>Role:</strong> {userBackendData.role}</p>
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
