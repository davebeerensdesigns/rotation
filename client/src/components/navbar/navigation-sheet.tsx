'use client';
import {Button} from '@/components/ui/button';
import {Home, Menu, Settings, User} from 'lucide-react';
import {Sheet, SheetContent, SheetTitle, SheetTrigger} from '@/components/ui/sheet';
import Link from 'next/link';
import {useState} from 'react';
import {useSession} from 'next-auth/react';

export const NavigationSheet = () => {
	const [open, setOpen] = useState(false);
	const {status} = useSession();
	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="outline" size="icon" className="rounded-full">
					<Menu/>
				</Button>
			</SheetTrigger>
			<SheetContent className="w-[320px] p-6">
				<SheetTitle>Main menu</SheetTitle>
				<div className="space-y-6">
					<div className="space-y-1">
						<Button variant="ghost" className="w-full justify-start text-sm" asChild>
							<Link href="/" onClick={() => setOpen(false)}>
								<Home className="h-4 w-4 mr-2"/> Home
							</Link>
						</Button>
						{
							status === 'authenticated' && (
								<>
									<Button variant="ghost" className="w-full justify-start text-sm" asChild>
										<Link href="/profile" onClick={() => setOpen(false)}>
											<User className="h-4 w-4 mr-2"/> View Profile
										</Link>
									</Button>
									<Button variant="ghost" className="w-full justify-start text-sm" asChild>
										<Link href="/profile/settings" onClick={() => setOpen(false)}>
											<Settings className="h-4 w-4 mr-2"/> Settings
										</Link>
									</Button>
								</>
							)
						}
					
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
};