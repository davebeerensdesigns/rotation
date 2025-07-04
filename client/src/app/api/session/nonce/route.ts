import {NextRequest, NextResponse} from 'next/server';

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const {visitorId} = body;
		
		const backendRes = await fetch('http://localhost:3001/api/session/nonce',
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