import {NextResponse} from 'next/server';

const serverUrl = process.env.SERVER_DOMAIN;
if (!serverUrl) {
	throw new Error('SERVER_DOMAIN is not set');
}

export async function GET() {
	try {
		const backendRes = await fetch(`${serverUrl}/api/siwe/message-params`,
			{
				method: 'GET',
				headers: {
					Accept: 'application/json'
				}
			}
		);
		
		if (!backendRes.ok) {
			return NextResponse.json({error: 'Failed to get message params from backend'},
				{status: backendRes.status}
			);
		}
		const {data} = await backendRes.json();
		
		return NextResponse.json(data);
	} catch (err) {
		console.error('[Proxy: message-params] Error:',
			err
		);
		return NextResponse.json({error: 'Internal Server Error'},
			{status: 500}
		);
	}
}
