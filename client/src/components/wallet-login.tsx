'use client';
import {JSX} from 'react';
import {WalletSheet} from '@/components/navbar/wallet-sheet';
import {NetworkSelectButton} from '@/components/network-select-button';
import {useSession} from 'next-auth/react';

export const WalletLogin = (): JSX.Element => {
	const {data: session} = useSession();
	if (session?.address) {
		return (
			<>
				<NetworkSelectButton/>
				<WalletSheet/>
			</>
		);
	}
	
	return <appkit-connect-button size="sm" label="Connect login" loadingLabel="Loading..."/>;
	
};
