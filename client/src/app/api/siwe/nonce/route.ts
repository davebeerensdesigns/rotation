import {NextRequest, NextResponse} from 'next/server';

const serverUrl = process.env.SERVER_DOMAIN;
if (!serverUrl) {
	throw new Error('SERVER_DOMAIN is not set');
}

export async function GET(req: NextRequest) {
	try {
		const fingerprint = req.headers.get('X-Client-Fingerprint') || '';
		const backendRes = await fetch(`${serverUrl}/api/siwe/nonce`,
			{
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'X-Client-Fingerprint': fingerprint
				},
				mode: 'cors',
				credentials: 'include'
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