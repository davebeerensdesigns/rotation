'use client';

import {Loader} from 'lucide-react';

export function LoaderIndicator({label}: { label: string }) {
	return (
		<p className="flex items-center gap-2 text-muted-foreground text-sm">
			<Loader className="h-4 w-4 animate-spin"/>
			{label}
		</p>
	);
}