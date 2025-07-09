'use client';

import {NavMenu} from './nav-menu';
import {NavigationSheet} from './navigation-sheet';
import {ModeToggle} from '@/components/toggles/mode-toggle';
import {JSX} from 'react';
import dynamic from 'next/dynamic';

const WalletLogin = dynamic(() => import('../wallet-login'),
	{
		ssr: false
	}
);

export function NavBar(): JSX.Element {
	return (
		<>
			<NavMenu className="hidden md:block"/>
			
			<div className="flex items-center gap-2">
				<ModeToggle/>
				<WalletLogin/>
				
				<div className="md:hidden">
					<NavigationSheet/>
				</div>
			</div>
		</>
	);
}