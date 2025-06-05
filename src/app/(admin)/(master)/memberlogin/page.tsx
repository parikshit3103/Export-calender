"use client";
import React from 'react';

// import State from '@/components/state/State';
import MemberLoginTab from '../memberlogintab/MemberLoginTab';
import MemberLoginArchive from '../memberloginarchive/MemberLoginArchive';

import { useEffect, useState } from 'react';
import { get, ref, remove, set , child } from 'firebase/database';
import { database } from '../../../lib/fireBaseConfig';// 
type Tab = 'Member Login' | 'Archive';

interface AdressProps {
  _id?: string;
  name: string;
  role: string ;
  userId: string;
  password: string;
  contact: string;
  wardNo : string ;
  wardName : string;

}


const page: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('Member Login');
      const [refreshKey, setRefreshKey] = useState<number>(Date.now());

        const triggerRefresh = () => setRefreshKey(Date.now());

    return (
        <div className="flex flex-col overflow-x-auto gap-4 p-2 ">
            <div className="flex mb-4 space-x-2">
                {(['Member Login', 'Archive'] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        className={`px-4 py-2 rounded-md ${
                            activeTab === tab ? 'bg-gray-300' : 'bg-gray-100'
                        }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'Member Login' && 'Member Login'}
                        {tab === 'Archive' && 'Archive'}
                    </button>
                ))}
            </div>

                        {activeTab === 'Member Login' &&  <MemberLoginTab refreshKey={refreshKey} />}
                        {activeTab === 'Archive' &&  <MemberLoginArchive refreshKey={refreshKey} onAction={triggerRefresh}/>}         
        </div>
    );
};

export default page;