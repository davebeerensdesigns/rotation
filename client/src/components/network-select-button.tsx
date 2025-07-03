'use client';

import {
	useAppKitAccount,
	useAppKitNetwork
} from '@reown/appkit/react';
import Image from 'next/image';
import {Button} from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {Check, Loader} from 'lucide-react';
import {chains, chainLogos} from '@/config';

export const NetworkSelectButton = () => {
	const {isConnected} = useAppKitAccount();
	const {
		caipNetwork,
		chainId,
		caipNetworkId,
		switchNetwork
	} = useAppKitNetwork();
	
	const currentLogo = chainId !== undefined ? chainLogos[Number(chainId)] : null;
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				{currentLogo && isConnected ? (
					<Button variant="outline" size="icon">
						<div className="w-[20px] h-[20px] flex items-center justify-center">
							<Image
								src={currentLogo}
								alt={`${caipNetwork?.name ?? 'Network'} logo`}
								width={20}
								height={20}
								className="object-contain w-auto h-[20px]"
							/>
						</div>
					</Button>
				) : (
					<Button variant="outline" size="icon">
						<Loader className="h-4 w-4 animate-spin"/>
					</Button>
				)}
			</DropdownMenuTrigger>
			
			{isConnected && (
				<DropdownMenuContent align="start">
					{chains.map((network) => {
						const id = Number(network.id);
						const logo = chainLogos[id];
						
						return (
							<DropdownMenuItem
								key={id}
								disabled={id === Number(chainId)}
								onClick={() => {
									try {
										switchNetwork(network);
									} catch (error) {
									}
								}}
								className="flex items-center gap-2"
							>
								{logo && (
									<div className="w-[20px] h-[20px] flex items-center justify-center">
										<Image
											src={logo}
											alt={`${network.name} logo`}
											width={20}
											height={20}
											className="object-contain w-auto h-[20px]"
										/>
									</div>
								)}
								{network.name}
								{id === Number(chainId) && (
									<Check className="ml-auto text-green-500"/>
								)}
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuContent>
			)}
		</DropdownMenu>
	);
};
