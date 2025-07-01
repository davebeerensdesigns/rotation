'use client';
import {useState} from 'react';
import {updateUserProfile} from '@/services/user.service';
import {useSession} from 'next-auth/react';
import {Button} from '@/components/ui/button';
import {Loader} from 'lucide-react';
import {useApiFetch} from '@/lib/api-fetch';

export function UpdateProfileButton({onSuccessAction}: { onSuccessAction: () => void }) {
	const [loading, setLoading] = useState(false);
	const {update} = useSession();
	const apiFetch = useApiFetch();
	
	const handleClick = async () => {
		try {
			setLoading(true);
			await updateUserProfile(apiFetch,
				update,
				{
					email: 'pietje3@piet.com',
					name: 'Pietje Puk3',
					picture: 'avatar2.jpg'
				}
			);
			onSuccessAction();
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};
	
	return (
		<Button onClick={handleClick} disabled={loading}>
			{loading ? (
				<>
					<Loader className="h-4 w-4 animate-spin"/>
					Updating...
				</>
			) : (
				'Update Profile'
			)}
		</Button>
	);
}
