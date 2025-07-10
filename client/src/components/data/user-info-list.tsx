import {UserData} from '@/types/user';

export function UserInfoList({data}: { data: UserData }) {
	return (
		<ul className="space-y-1 text-sm">
			<li><strong>Address:</strong> {data.address}</li>
			<li><strong>Chain ID:</strong> {data.chainId}</li>
			<li><strong>Email:</strong> {data.email}</li>
			<li><strong>Name:</strong> {data.name}</li>
			<li><strong>Image:</strong> {data.picture}</li>
			<li><strong>User ID:</strong> {data.userId}</li>
			<li><strong>Role:</strong> {data.role}</li>
		</ul>
	);
}