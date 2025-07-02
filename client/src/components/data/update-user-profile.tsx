'use client';

import {useState} from 'react';
import {updateUserProfile} from '@/services/user.service';
import {useSession} from 'next-auth/react';
import {Button} from '@/components/ui/button';
import {Loader} from 'lucide-react';
import {useApiFetch} from '@/lib/api-fetch';
import {toast} from 'sonner';

export function UpdateProfileButton({onSuccessAction}: { onSuccessAction: () => void }) {
	const [loading, setLoading] = useState(false);
	const {update} = useSession();
	const apiFetch = useApiFetch();
	
	const handleClick = () => {
		setLoading(true);
		
		const promise = updateUserProfile(apiFetch,
			update,
			{
				email: 'pietje3@piet.com',
				name: 'Pietje Puk3',
				picture: 'avatar2.jpg'
			}
		)
			.then(() => {
				onSuccessAction();
			})
			.finally(() => {
				setLoading(false);
			});
		
		toast.promise(promise,
			{
				loading: 'Updating profile...',
				success: 'Successfully updated profile!',
				error: (err) => {
					const message = err instanceof Error ? err.message : 'Unknown error';
					return `Update failed: ${message}`;
				}
			}
		);
		
	};
	
	return (
		<Button onClick={handleClick} disabled={loading}>
			{loading ? (
				<>
					<Loader className="h-4 w-4 animate-spin mr-2"/>
					Updating...
				</>
			) : (
				'Update Profile'
			)}
		</Button>
	);
}
