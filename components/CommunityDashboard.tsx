import React, { useState } from 'react';
import AthleteSpotlights from './AthleteSpotlights';
import FindBuddies from './FindBuddies';
import BuddyConnections from './BuddyConnections';
import CommunityChallenges from './CommunityChallenges';
import { SparklesIcon, UserGroupIcon, FlagIcon } from './icons';

type SocialTab = 'spotlights' | 'find' | 'connections' | 'challenges';

const SocialDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SocialTab>('spotlights');

  const tabs = [
    { id: 'spotlights', label: 'Spotlights', icon: <SparklesIcon className="w-5 h-5 mr-2" /> },
    { id: 'find', label: 'Find a Buddy', icon: <UserGroupIcon className="w-5 h-5 mr-2" /> },
    { id: 'connections', label: 'My Connections', icon: <UserGroupIcon className="w-5 h-5 mr-2" /> },
    { id: 'challenges', label: 'Challenges', icon: <FlagIcon className="w-5 h-5 mr-2" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Community Hub</h2>
      
      <div className="mb-6 border-b border-gray-700">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SocialTab)}
              className={`whitespace-nowrap flex items-center py-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === tab.id
                  ? 'border-indigo-400 text-indigo-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-700">
        {activeTab === 'spotlights' && <AthleteSpotlights />}
        {activeTab === 'find' && <FindBuddies />}
        {activeTab === 'connections' && <BuddyConnections />}
        {activeTab === 'challenges' && <CommunityChallenges />}
      </div>
    </div>
  );
};

export default SocialDashboard;
