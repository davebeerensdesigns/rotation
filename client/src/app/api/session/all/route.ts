import {auth} from '@/auth';
import {NextResponse} from 'next/server';

const serverUrl = process.env.SERVER_DOMAIN;
if (!serverUrl) {
	throw new Error('SERVER_DOMAIN is not set');
}

export async function GET() {
	const session = await auth();
	
	if (!session || !session.user?.accessToken) {
		return NextResponse.json({error: 'Unauthorized'},
			{status: 401}
		);
	}
	
	try {
		const backendRes = await fetch(`${serverUrl}/api/session/all`,
			{
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${session.user.accessToken}`,
					'Content-Type': 'application/json'
				}
			}
		);
		
		const json = await backendRes.json();
		return NextResponse.json(json,
			{status: backendRes.status}
		);
		
	} catch (err) {
		return NextResponse.json({error: 'Failed to fetch user data'},
			{status: 500}
		);
	}
}