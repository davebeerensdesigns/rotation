import {NextRequest, NextResponse} from 'next/server';

const serverUrl = process.env.SERVER_DOMAIN;
if (!serverUrl) {
	throw new Error('SERVER_DOMAIN is not set');
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		
		const backendRes = await fetch(`${serverUrl}/api/session/verify`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				body: JSON.stringify(body)
			}
		);
		
		const json = await backendRes.json();
		
		return NextResponse.json(json,
			{status: backendRes.status}
		);
	} catch (error) {
		return NextResponse.json(
			{error: 'Failed to verify session'},
			{status: 500}
		);
	}
}