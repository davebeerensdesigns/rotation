'use client';
import {JSX} from 'react';
import {WalletSheet} from '@/components/navbar/wallet-sheet';
import {NetworkSelectButton} from '@/components/network-select-button';
import {useSession} from 'next-auth/react';
import {useAppKitAccount} from '@reown/appkit/react';

export const WalletLogin = (): JSX.Element => {
	const {data: session} = useSession();
	const {isConnected} = useAppKitAccount();
	if (session?.address && isConnected) {
		return (
			<>
				<NetworkSelectButton/>
				<WalletSheet/>
			</>
		);
	}
	
	return <appkit-connect-button size="sm" label="Connect wallet" loadingLabel="Loading..."/>;
	
};
