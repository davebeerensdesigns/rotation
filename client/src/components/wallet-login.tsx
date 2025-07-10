'use client';
import {JSX} from 'react';
import {WalletSheet} from '@/components/navbar/wallet-sheet';
import {NetworkSelectButton} from '@/components/network-select-button';
import {useSession} from 'next-auth/react';
import {useAppKitAccount} from '@reown/appkit/react';
import dynamic from 'next/dynamic';

const CustomConnectButton = dynamic(() => import('./custom-connect-button'),
	{
		ssr: false
	}
);

export default function WalletLogin(): JSX.Element | null {
	const {data: session} = useSession();
	const {
		isConnected,
		status
	} = useAppKitAccount();
	
	const isWalletReady = status !== 'reconnecting' && status !== 'connecting' && status !== undefined;
	
	if (!isWalletReady) return null;
	
	if (session?.address && isConnected) {
		return (
			<>
				<NetworkSelectButton/>
				<WalletSheet/>
			</>
		);
	}
	
	return <CustomConnectButton status={status} connected={isConnected}/>;
};

