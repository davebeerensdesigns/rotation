'use client';
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList
} from '@/components/ui/navigation-menu';
import {NavigationMenuProps} from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import {JSX} from 'react';
import {useSession} from 'next-auth/react';

export const NavMenu = (props: NavigationMenuProps): JSX.Element => {
	const {data: session} = useSession();
	
	return (
		<NavigationMenu {...props}>
			<NavigationMenuList
				className="gap-4 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start">
				<NavigationMenuItem>
					<NavigationMenuLink asChild>
						<Link href="/">Home</Link>
					</NavigationMenuLink>
				</NavigationMenuItem>
				{session?.address && (<>
						<NavigationMenuItem>
							<NavigationMenuLink asChild>
								<Link href="/profile">Profile</Link>
							</NavigationMenuLink>
						</NavigationMenuItem>
						<NavigationMenuItem>
							<NavigationMenuLink asChild>
								<Link href="/profile/settings">Settings</Link>
							</NavigationMenuLink>
						</NavigationMenuItem>
					</>
				)}
			</NavigationMenuList>
		</NavigationMenu>
	);
};