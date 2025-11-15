import React, { useEffect } from 'react';
import { useBuddies } from '../lib/hooks/useBuddies';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import { useAuth } from './AuthProvider';

const BuddyConnections: React.FC = () => {
  const { user } = useAuth();
  const {
    connections,
    loading,
    error,
    fetchConnections,
    updateConnectionStatus,
  } = useBuddies();

  useEffect(() => {
    fetchConnections();
  }, []);

  if (loading) return <div className="flex justify-center py-8"><LoadingSpinner /></div>;
  if (error) return <ErrorMessage error={error} />;

  const incomingRequests = connections.filter(c => c.status === 'pending' && c.addressee_id === user?.id);
  const sentRequests = connections.filter(c => c.status === 'pending' && c.requester_id === user?.id);
  const myBuddies = connections.filter(c => c.status === 'accepted');

  const renderConnectionList = (title: string, list: typeof connections, type: 'incoming' | 'sent' | 'buddy') => (
    <div>
      <h3 className="text-lg font-semibold mb-3">{title} ({list.length})</h3>
      {list.length > 0 ? (
        <div className="space-y-3">
          {list.map(conn => {
            // Fix: Use the new 'requester' and 'addressee' properties to get the other user's profile.
            const otherUser = conn.requester_id === user?.id ? conn.addressee : conn.requester;
            return (
              <div key={conn.id} className="bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-600 mr-3 flex items-center justify-center font-bold">
                    {otherUser?.username?.[0]?.toUpperCase() ?? 'A'}
                  </div>
                  <div>
                    <p className="font-semibold">{otherUser?.username}</p>
                    <p className="text-xs text-gray-400">{otherUser?.location || 'Location not specified'}</p>
                  </div>
                </div>
                <div>
                  {type === 'incoming' && (
                    <div className="flex space-x-2">
                      <button onClick={() => updateConnectionStatus(conn.id, 'accepted')} className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">Accept</button>
                      <button onClick={() => updateConnectionStatus(conn.id, 'declined')} className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">Decline</button>
                    </div>
                  )}
                  {type === 'sent' && (
                    <button onClick={() => updateConnectionStatus(conn.id, 'declined')} className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-500">Cancel</button>
                  )}
                  {type === 'buddy' && (
                     <button onClick={() => updateConnectionStatus(conn.id, 'declined')} className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">Remove</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400 text-sm italic">None</p>
      )}
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">My Connections</h2>
      <div className="space-y-6">
        {renderConnectionList('Incoming Requests', incomingRequests, 'incoming')}
        {renderConnectionList('My Buddies', myBuddies, 'buddy')}
        {renderConnectionList('Sent Requests', sentRequests, 'sent')}
      </div>
    </div>
  );
};

export default BuddyConnections;