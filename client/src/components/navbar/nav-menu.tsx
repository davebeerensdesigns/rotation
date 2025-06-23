'use client';
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList
} from '@/components/ui/navigation-menu';
import {NavigationMenuProps} from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import {useAppKitAccount} from '@reown/appkit-controllers/react';

export function NavMenu(props: NavigationMenuProps) {
	
	const {
		isConnected
	} = useAppKitAccount();
	return (
		<NavigationMenu {...props}>
			<NavigationMenuList
				className="gap-4 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start">
				<NavigationMenuItem>
					<NavigationMenuLink asChild>
						<Link href="/">Home</Link>
					</NavigationMenuLink>
				</NavigationMenuItem>
				{isConnected && (
					<NavigationMenuItem>
						<NavigationMenuLink asChild>
							<Link href="/profile">Profile</Link>
						</NavigationMenuLink>
					</NavigationMenuItem>
				)}
			</NavigationMenuList>
		</NavigationMenu>
	);
}