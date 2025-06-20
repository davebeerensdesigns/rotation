'use client';
import {Button} from '@/components/ui/button';
import {Sheet, SheetContent, SheetTitle, SheetTrigger} from '@/components/ui/sheet';
import {shortenAddress} from '@/lib/utils';
import {JSX, useState} from 'react';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {LogOut, Pencil, User} from 'lucide-react';
import {useDisconnect} from '@reown/appkit/react';
import Link from 'next/link';
import {signOut, useSession} from 'next-auth/react';

export const WalletSheet = (): JSX.Element => {
	const {data: session} = useSession();
	const [open, setOpen] = useState(false);
	const {disconnect} = useDisconnect();
	
	const handleLogout = async () => {
		try {
			await disconnect();
			await signOut({redirect: false});
			setOpen(false);
		} catch (err) {
			console.error('[Logout] Failed to logout cleanly',
				err
			);
		}
	};
	
	const shortAddress = shortenAddress(session?.address);
	
	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="outline">
					{shortAddress}
				</Button>
			</SheetTrigger>
			<SheetContent className="w-[320px] p-6">
				<SheetTitle>User menu</SheetTitle>
				<div className="space-y-6">
					{/* Profile */}
					<div className="flex items-center gap-4">
						<Avatar className="h-12 w-12">
							{session?.user?.image && <AvatarImage src={session.user.image}/>}
							{session?.user?.name &&
								<AvatarFallback>{session.user.name?.[0]?.toUpperCase()}</AvatarFallback>}
						</Avatar>
						<div className="flex-1">
							<div className="flex items-center justify-between">
								<p className="font-semibold text-sm mb-1">
									{session?.user?.name && <span className="block">{session.user.name}</span>}
									{session?.user?.email && <span className="block">{session.user.email}</span>}
								</p>
								<Button size="icon" variant="ghost" className="h-6 w-6" aria-label="Edit profile">
									<Pencil className="h-4 w-4"/>
								</Button>
							</div>
							<p className="text-xs text-muted-foreground">{shortAddress}</p>
						</div>
					</div>
					
					{/* Actions */}
					<div className="space-y-1">
						<Button variant="ghost" className="w-full justify-start text-sm" asChild>
							<Link href="/profile" onClick={() => setOpen(false)}>
								<User className="h-4 w-4 mr-2"/> View Profile
							</Link>
						</Button>
						<Button variant="ghost" onClick={handleLogout}
								className="w-full justify-start text-sm text-red-500 hover:text-red-600">
							<LogOut className="h-4 w-4 mr-2"/> Disconnect
						</Button>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
};
