'use client';

import {signOut} from 'next-auth/react';
import {setNextToast} from '@/lib/toast-message';
import {getVisitorId} from '@/lib/fingerprint';

type ApiFetch = (
	input: string | Request | URL,
	init?: RequestInit
) => Promise<Response>;

export function useApiFetch(): ApiFetch {
	return async function apiFetch(
		input,
		init = {}
	): Promise<Response> {
		const visitorId = await getVisitorId();
		
		const mergedHeaders = {
			...init.headers,
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'X-Client-Fingerprint': visitorId
		};
		
		const res = await fetch(input,
			{
				...init,
				headers: mergedHeaders
			}
		);
		
		if (res.status === 401 || res.status === 400) {
			setNextToast('error',
				'Logout',
				'Your session has been revoked or expired. Please log in again.'
			);
			await signOut({
				redirect: true,
				redirectTo: '/'
			});
		}
		
		return res;
	};
}
