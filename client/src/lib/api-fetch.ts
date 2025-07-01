'use client';

import {useSession} from 'next-auth/react';

type ApiFetch = (
	input: string | Request | URL,
	init?: RequestInit
) => Promise<Response>;

export function useApiFetch(): ApiFetch {
	const {update} = useSession();
	
	return async function apiFetch(
		input: string | Request | URL,
		init?: RequestInit
	): Promise<Response> {
		const res = await fetch(input,
			init
		);
		
		if (res.status === 401) {
			console.warn('[apiFetch] 401 — marking session invalid');
			await update({error: 'RefreshAccessTokenError'});
		}
		
		return res;
	};
}
