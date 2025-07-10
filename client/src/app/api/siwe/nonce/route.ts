import {NextRequest, NextResponse} from 'next/server';

const serverUrl = process.env.SERVER_DOMAIN;
if (!serverUrl) {
	throw new Error('SERVER_DOMAIN is not set');
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const {visitorId} = body;
		
		const backendRes = await fetch(`${serverUrl}/api/siwe/nonce`,
			{
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				mode: 'cors',
				credentials: 'include',
				body: JSON.stringify({
					visitorId
				})
			}
		);
		
		const {data} = await backendRes.json();
		return new NextResponse(data.nonce);
		
	} catch (err) {
		return NextResponse.json({error: 'Failed to fetch nonce'},
			{status: 500}
		);
	}
}