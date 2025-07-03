'use client';

import {signOut, useSession} from 'next-auth/react';
import {setNextToast} from '@/lib/toast-message';

type ApiFetch = (
	input: string | Request | URL,
	init?: RequestInit
) => Promise<Response>;

export function useApiFetch(): ApiFetch {
	
	return async function apiFetch(
		input: string | Request | URL,
		init?: RequestInit
	): Promise<Response> {
		const res = await fetch(input,
			init
		);
		
		if (res.status === 401) {
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
