import {Logo} from './logo';
import Link from 'next/link';
import {NavBar} from './navbar';

export function NavbarShell() {
	return (
		<nav
			className="fixed z-10 top-6 inset-x-4 p-0  bg-background/50 backdrop-blur-sm border dark:border-slate-700/70 max-w-screen-xl mx-auto rounded-md">
			<div className="h-full flex items-center justify-between mx-auto p-2">
				<Link className="ps-2" href="/"><Logo/></Link>
				<NavBar/>
			</div>
		</nav>
	);
}
