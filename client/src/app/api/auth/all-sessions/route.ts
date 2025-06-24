import {auth} from '@/auth'; // uit je middleware-config, dus werkt
import {NextResponse} from 'next/server';

export async function GET() {
	const session = await auth(); // hiermee krijg je de sessie (JWT-strategie)
	
	if (!session || !session.user?.accessToken) {
		return NextResponse.json({error: 'Unauthorized'},
			{status: 401}
		);
	}
	
	try {
		const backendRes = await fetch('http://10.0.1.50:3001/api/auth/session/all',
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