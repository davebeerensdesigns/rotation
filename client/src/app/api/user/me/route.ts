import {auth} from '@/auth';
import {NextResponse} from 'next/server';

export async function GET() {
	const session = await auth();
	
	if (!session || !session.user?.accessToken) {
		return NextResponse.json({error: 'Unauthorized'},
			{status: 401}
		);
	}
	
	try {
		const backendRes = await fetch('http://localhost:3001/api/user/me',
			{
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${session.user.accessToken}`,
					'Content-Type': 'application/json'
				}
			}
		);
		const result = await backendRes.json();
		
		if (!backendRes.ok) {
			return NextResponse.json({error: result.error || 'User data fetch failed'},
				{status: backendRes.status}
			);
		}
		
		return NextResponse.json(result);
		
	} catch (err) {
		return NextResponse.json({error: 'Failed to fetch user data'},
			{status: 500}
		);
	}
}