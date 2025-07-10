'use client';

import {toast} from 'sonner';

export type ToastType = 'success' | 'error' | 'info';

const TOAST_KEY = '@rotation/toast_message';

interface ToastPayload {
	type: ToastType;
	title: string;
	description?: string;
}

function isToastType(value: any): value is ToastType {
	return ['success',
		'error',
		'info'].includes(value);
}

export function setNextToast(
	type: ToastType,
	title: string,
	description?: string
) {
	if (typeof window === 'undefined') return;
	const payload: ToastPayload = {
		type,
		title,
		description
	};
	localStorage.setItem(TOAST_KEY,
		JSON.stringify(payload)
	);
}

export function getAndClearToast(): ToastPayload | null {
	if (typeof window === 'undefined') return null;
	
	const raw = localStorage.getItem(TOAST_KEY);
	if (!raw) return null;
	
	localStorage.removeItem(TOAST_KEY);
	
	try {
		const parsed = JSON.parse(raw);
		
		if (
			typeof parsed.title === 'string' &&
			isToastType(parsed.type)
		) {
			return {
				type: parsed.type,
				title: parsed.title,
				description: typeof parsed.description === 'string' ? parsed.description : undefined
			};
		}
		
		return null;
	} catch {
		return null;
	}
}

export function showToast(
	type: ToastType,
	title: string,
	description?: string
) {
	if (typeof window === 'undefined') return;
	
	const options = description ? {description} : undefined;
	
	switch (type) {
		case 'success':
			toast.success(title,
				options
			);
			break;
		case 'error':
			toast.error(title,
				options
			);
			break;
		case 'info':
		default:
			toast(title,
				options
			);
			break;
	}
}

