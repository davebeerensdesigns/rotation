import {auth} from '@/auth';
import {DataWrapper} from '@/components/data/data-wrapper';

export default async function ProfilePage() {
	const session = await auth();
	return (
		<>
			<h1 className="my-6 text-3xl sm:text-xl md:text-2xl md:leading-[1.2] font-bold">
				Profile
			</h1>
			{session ? (
				<DataWrapper/>
			) : (
				<p>You are not logged in.</p>
			)}
		</>
	);
}