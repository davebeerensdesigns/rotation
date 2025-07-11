import {auth} from '@/auth';
import {NextRequest, NextResponse} from 'next/server';

const serverUrl = process.env.SERVER_DOMAIN;
if (!serverUrl) {
	throw new Error('SERVER_DOMAIN is not set');
}

export async function PATCH(req: NextRequest) {
	const session = await auth();
	
	if (!session || !session.user?.accessToken) {
		return NextResponse.json({error: 'Unauthorized'},
			{status: 401}
		);
	}
	
	const body = await req.json();
	
	try {
		const fingerprint = req.headers.get('X-Client-Fingerprint') || '';
		const backendRes = await fetch(`${serverUrl}/api/user/update`,
			{
				method: 'PATCH',
				headers: {
					'Authorization': `Bearer ${session.user.accessToken}`,
					'Content-Type': 'application/json',
					'X-Client-Fingerprint': fingerprint
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
		return NextResponse.json({error: 'Internal server error'},
			{status: 500}
		);
	}
}