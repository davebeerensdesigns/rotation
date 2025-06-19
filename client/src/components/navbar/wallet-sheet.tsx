'use client';
import {Button} from '@/components/ui/button';
import {Sheet, SheetContent, SheetTrigger} from '@/components/ui/sheet';
import {shortenAddress} from '@/lib/utils';
import {JSX} from 'react';

type WalletSheetProps = {
	address?: string;
};

export const WalletSheet = ({address}: WalletSheetProps): JSX.Element => {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">
					{shortenAddress(address)}
				</Button>
			</SheetTrigger>
			<SheetContent>
				<span>{address}</span>
			</SheetContent>
		</Sheet>
	);
};
