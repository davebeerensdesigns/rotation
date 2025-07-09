'use client';

import {Button} from '@/components/ui/button';
import {modal} from '@/context';
import React from 'react';

type WalletStatus = 'reconnecting' | 'connected' | 'disconnected' | 'connecting';

interface CustomConnectButtonProps {
	status?: WalletStatus;
	connected?: boolean;
}

export default function CustomConnectButton({
	status,
	connected
}: CustomConnectButtonProps) {
	const getButtonLabel = (): string => {
		if (connected === false) return 'Connect wallet';
		
		switch (status) {
			case 'disconnected':
				return 'Connect wallet';
			case 'connecting':
				return 'Connecting...';
			case 'reconnecting':
				return 'Reconnecting...';
			case 'connected':
				return 'Connected';
			default:
				return 'Connect';
		}
	};
	
	return (
		<div className="space-y-2">
			<Button
				onClick={() => modal?.open?.()}
				disabled={status === 'connecting' || status === 'reconnecting'}
			>
				{getButtonLabel()}
			</Button>
		</div>
	);
}
