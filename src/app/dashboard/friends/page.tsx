'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  searchUsers, 
  getFriends, 
  getPendingRequests,
  getSentRequests,
  getFriendSuggestions,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend
} from '@/lib/backend';
import { Friend, FriendshipData, FriendRequest } from '@/types';
import Image from 'next/image';

type TabType = 'friends' | 'requests' | 'suggestions';

export default function FriendsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [friends, setFriends] = useState<FriendshipData[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.replace('/auth/login');
      return;
    }
    
    if (!authLoading && authUser) {
      loadData();
    }
  }, [authUser, authLoading, router]);

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadData = async () => {
    setIsLoading(true);
    
    try {
      const [friendsData, requestsData, sentRequestsData, suggestionsData] = await Promise.all([
        getFriends(),
        getPendingRequests(),
        getSentRequests(),
        getFriendSuggestions()
      ]);
      
      console.log('Loaded data:', {
        friends: friendsData?.length || 0,
        requests: requestsData?.length || 0, 
        sentRequests: sentRequestsData?.length || 0,
        suggestions: suggestionsData?.length || 0
      });
      
      console.log('Sent requests data:', sentRequestsData);
      
      setFriends(friendsData as FriendshipData[] || []);
      setRequests(requestsData as FriendRequest[] || []);
      setSentRequests(sentRequestsData as unknown as FriendRequest[] || []);
      setSuggestions(suggestionsData as Friend[] || []);
    } catch (err: unknown) {
      console.error('Failed to load friends data:', err);
      // Error handling could be added here
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async (query: string) => {
    setIsSearching(true);
    
    try {
      const results = await searchUsers(query);
      setSearchResults(results as Friend[] || []);
    } catch (err: unknown) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      // Reload data to reflect changes
      await loadData();
    } catch (err: unknown) {
      console.error('Failed to accept friend request:', err);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await declineFriendRequest(requestId);
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err: unknown) {
      console.error('Failed to decline friend request:', err);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    try {
      await sendFriendRequest(userId);
      // Remove from suggestions and search results
      setSuggestions(prev => prev.filter(u => u.id !== userId));
      setSearchResults(prev => prev.filter(u => u.id !== userId));
    } catch (err: unknown) {
      console.error('Failed to send friend request:', err);
    }
  };

  // Helper function to get relationship status for a user
  const getRelationshipStatus = (userId: string) => {
    if (!authUser) return 'none';
    
    // Check if already friends
    const isFriend = friends.some(friendship => {
      return friendship.friend?.id === userId;
    });
    
    if (isFriend) return 'friend';
    
    // Check for received requests
    const hasReceivedRequest = requests.some(request => 
      request.requester?.id === userId
    );
    
    if (hasReceivedRequest) return 'pending_received';
    
    // Check for sent requests - need to check friend_id since that's the recipient
    const hasSentRequest = sentRequests.some(request => 
      request.friend_id === userId
    );
    
    if (hasSentRequest) return 'pending_sent';
    
    return 'none';
  };

  // Render button based on relationship status
  const renderRelationshipButton = (user: Friend) => {
    const status = getRelationshipStatus(user.id);
    
    switch (status) {
      case 'friend':
        return (
          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
            Friends
          </span>
        );
      case 'pending_sent':
        return (
          <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium">
            Request Sent
          </span>
        );
      case 'pending_received':
        return (
          <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium">
            Request Received
          </span>
        );
      default:
        return (
          <button
            onClick={() => handleSendFriendRequest(user.id)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Add Friend
          </button>
        );
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      await removeFriend(friendshipId);
      // Reload data to reflect changes
      await loadData();
    } catch (err: unknown) {
      console.error('Failed to remove friend:', err);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const tabs = [
    { id: 'friends' as TabType, label: 'My Friends', count: friends.length },
    { id: 'requests' as TabType, label: 'Requests', count: requests.length },
    { id: 'suggestions' as TabType, label: 'Suggestions', count: suggestions.length },
  ];

  // Show loading if auth or data is loading
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 safe-area-top">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">Friends</h1>
          </div>
        </div>

        {/* Loading */}
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Redirect if not authenticated
  if (!authUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 safe-area-top">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Friends</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or username"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
            />
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery.trim().length > 2 && (
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Search Results</h2>
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {user.profile_picture_url ? (
                          <Image
                            src={user.profile_picture_url}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-sm font-medium text-orange-700">
                            {getInitials(user.name)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{user.name}</h3>
                        <p className="text-sm text-gray-600 truncate">@{user.username}</p>
                      </div>
                    </div>
                    {renderRelationshipButton(user)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No users found</p>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'friends' && (
          <div className="space-y-3">
            {friends.length > 0 ? (
              friends.map((friendship) => (
                <div key={friendship.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {friendship.friend?.profile_picture_url ? (
                          <Image
                            src={friendship.friend.profile_picture_url}
                            alt={friendship.friend.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-sm font-medium text-orange-700">
                            {getInitials(friendship.friend?.name || 'User')}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{friendship.friend?.name || 'User'}</h3>
                        <p className="text-sm text-gray-600">@{friendship.friend?.username || 'username'}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">
                            {friendship.friend?.recommendations_count || 0} recommendations
                          </span>
                          <span className="text-xs text-gray-500">
                            {friendship.friend?.friends_count || 0} friends
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFriend(friendship.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No friends yet</h3>
                <p className="text-gray-500">Start by adding friends to share food recommendations</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-3">
            {requests.length > 0 ? (
              requests.map((request) => (
                <div key={request.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {request.requester?.profile_picture_url ? (
                          <Image
                            src={request.requester.profile_picture_url}
                            alt={request.requester.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-sm font-medium text-green-700">
                            {getInitials(request.requester?.name || 'User')}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.requester?.name || 'User'}</h3>
                        <p className="text-sm text-gray-600">@{request.requester?.username || 'username'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Requested {formatTimeAgo(new Date(request.created_at))}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(request.id)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                <p className="text-gray-500">Friend requests will appear here</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="space-y-3">
            {suggestions.length > 0 ? (
              suggestions.map((user) => (
                <div key={user.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {user.profile_picture_url ? (
                          <Image
                            src={user.profile_picture_url}
                            alt={user.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-sm font-medium text-blue-700">
                            {getInitials(user.name)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600">@{user.username}</p>
                        {user.bio && <p className="text-xs text-gray-500 mt-1">{user.bio}</p>}
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">
                            {user.recommendations_count || 0} recommendations
                          </span>
                          <span className="text-xs text-gray-500">
                            {user.friends_count || 0} friends
                          </span>
                        </div>
                      </div>
                    </div>
                    {renderRelationshipButton(user)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions available</h3>
                <p className="text-gray-500">Check back later for friend suggestions</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}