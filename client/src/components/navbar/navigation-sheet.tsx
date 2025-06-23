import {Button} from '@/components/ui/button';
import {Menu} from 'lucide-react';
import {Logo} from './logo';
import {NavMenu} from './nav-menu';
import {Sheet, SheetContent, SheetTitle, SheetTrigger} from '@/components/ui/sheet';

export const NavigationSheet = () => {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline" size="icon" className="rounded-full">
					<Menu/>
				</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetTitle>Main menu</SheetTitle>
				<Logo/>
				<NavMenu orientation="vertical" className="mt-12"/>
				
				<div className="mt-8 space-y-4">
					<Button variant="outline" className="w-full sm:hidden">
						Sign In
					</Button>
					<Button className="w-full xs:hidden">Get Started</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
};