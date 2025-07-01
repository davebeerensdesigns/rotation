'use client';
import {useState} from 'react';
import {SessionDataColumn} from './session-data-column';
import {BackendDataColumn} from './backend-data-column';
import {UpdateProfileButton} from '@/components/data/update-user-profile';

export function DataWrapper() {
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	
	const handleRefresh = () => setRefreshTrigger((prev) => prev + 1);
	
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 max-w-screen-xl mx-auto">
			<SessionDataColumn/>
			<BackendDataColumn refreshTrigger={refreshTrigger}/>
			<div className="col-span-2 pt-4">
				<UpdateProfileButton onSuccessAction={handleRefresh}/>
			</div>
		</div>
	);
}
