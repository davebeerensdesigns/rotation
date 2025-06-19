import {Logo} from './logo';
import {NavMenu} from './nav-menu';
import {NavigationSheet} from './navigation-sheet';
import {ModeToggle} from '@/components/toggles/mode-toggle';
import {WalletLogin} from '@/components/wallet-login';
import Link from 'next/link';

const Navbar = () => {
	return (
		<nav
			className="fixed z-10 top-6 inset-x-4 p-0  bg-background/50 backdrop-blur-sm border dark:border-slate-700/70 max-w-screen-xl mx-auto rounded-md">
			<div className="h-full flex items-center justify-between mx-auto p-2">
				<Link className="ps-2" href="/"><Logo/></Link>
				
				{/* Desktop Menu */}
				<NavMenu className="hidden md:block"/>
				
				<div className="flex items-center gap-2">
					<ModeToggle/>
					<WalletLogin/>
					
					{/* Mobile Menu */}
					<div className="md:hidden">
						<NavigationSheet/>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;