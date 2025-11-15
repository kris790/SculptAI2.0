import React, { useState } from 'react';
import { useSpotlights } from '../lib/hooks/useSpotlights';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import { HeartIcon } from './icons';

const AthleteSpotlights: React.FC = () => {
  const { spotlights, loading, error, createSpotlight, toggleLike } = useSpotlights();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSpotlight(formData.title, formData.content);
    setFormData({ title: '', content: '' });
    setShowCreateForm(false);
  };

  if (loading) return <div className="flex justify-center py-8"><LoadingSpinner /></div>;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Athlete Spotlights</h2>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Share My Story'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-gray-700/50 p-4 rounded-lg mb-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Title of your story"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 bg-gray-700 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <textarea
              placeholder="Share your journey, challenges, and successes..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              className="w-full p-2 bg-gray-700 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Post Story
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {spotlights.length > 0 ? (
          spotlights.map((spotlight) => (
            <div key={spotlight.id} className="border border-gray-700 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-600 mr-3 flex items-center justify-center font-bold">
                  {spotlight.user_profiles?.username?.[0]?.toUpperCase() ?? 'A'}
                </div>
                <div>
                  <h3 className="font-semibold">{spotlight.user_profiles?.username ?? 'Anonymous'}</h3>
                  <p className="text-sm text-gray-400">{new Date(spotlight.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <h4 className="text-lg font-medium mb-2 text-indigo-300">{spotlight.title}</h4>
              <p className="text-gray-300 mb-4 whitespace-pre-wrap">{spotlight.content}</p>
              <button
                onClick={() => toggleLike(spotlight.id, spotlight.is_liked_by_user)}
                className={`flex items-center space-x-1 ${
                  spotlight.is_liked_by_user ? 'text-red-500' : 'text-gray-500'
                } hover:text-red-500 transition-colors`}
              >
                <HeartIcon className="w-5 h-5" />
                <span>{spotlight.likes_count || 0}</span>
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 py-8">No spotlights yet. Be the first to share your story!</p>
        )}
      </div>
    </div>
  );
};

export default AthleteSpotlights;
