'use client';

import {useEffect} from 'react';
import {toast} from 'sonner';
import {getAndClearToast} from '@/lib/toast-message';

export function ToastTrigger() {
	useEffect(() => {
			const stored = getAndClearToast();
			if (!stored) return;
			
			const {
				type,
				title,
				description
			} = stored;
			
			toast[type](title,
				{
					description
				}
			);
		},
		[]
	);
	
	return null;
}
