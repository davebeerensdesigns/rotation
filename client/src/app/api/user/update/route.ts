import {auth} from '@/auth'; // uit je middleware-config, dus werkt
import {NextResponse} from 'next/server';

export async function PATCH(req: Request) {
	const session = await auth(); // hiermee krijg je de sessie (JWT-strategie)
	
	if (!session || !session.user?.accessToken) {
		return NextResponse.json({error: 'Unauthorized'},
			{status: 401}
		);
	}
	
	const body = await req.json();
	
	try {
		const backendRes = await fetch('http://localhost:3001/api/user/update',
			{
				method: 'PATCH',
				headers: {
					'Authorization': `Bearer ${session.user.accessToken}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(body)
			}
		);
		
		const result = await backendRes.json();
		
		if (!backendRes.ok) {
			return NextResponse.json({error: result.error || 'Update failed'},
				{status: backendRes.status}
			);
		}
		
		return NextResponse.json(result);
	} catch (err) {
		console.error('[PROXY] Failed to forward PATCH /api/user/update',
			err
		);
		return NextResponse.json({error: 'Internal server error'},
			{status: 500}
		);
	}
}