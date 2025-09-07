"use client"
import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar';
interface User {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

export default function Following() {
  const [activeTab, setActiveTab] = useState<'following' | 'followers'>('following');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {

    

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        if (!token) { 
          window.location.href = '/login';
        }

        const endpoint = activeTab === 'following' 
          ? 'https://api.github.com/user/following'
          : 'https://api.github.com/user/followers';

        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (!response.ok) throw new Error(`GitHub API error: ${response.statusText}`);

        const data = await response.json();
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [activeTab]);

  const handleFollow = async (username: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await fetch(`https://api.github.com/user/following/${username}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Length': '0'
        }
      });
      
      // Refresh the list
      setUsers(prevUsers => 
        prevUsers.filter(user => user.login !== username)
      );
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  const handleUnfollow = async (username: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await fetch(`https://api.github.com/user/following/${username}`, {
        method: 'DELETE',
        headers: { 'Authorization': `token ${token}` }
      });
      
      // Refresh the list
      setUsers(prevUsers => 
        prevUsers.filter(user => user.login !== username)
      );
    } catch (err) {
      console.error('Error unfollowing user:', err);
    }
  };

  return (
    <div className='flex flex-col space-y-9'>
    <div className='mt-5'>   
    <Navbar />
    </div>
    <div className="min-h-screen bg-black text-white p-4 md:p-8 ">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-indigo-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          {activeTab === 'following' ? 'Following' : 'Followers'}
        </h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('following')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'following' 
              ? 'text-indigo-400 border-b-2 border-indigo-400' 
              : 'text-gray-400 hover:text-white'
            }`}
          >
            Following
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'followers' 
                ? 'text-indigo-400 border-b-2 border-indigo-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Followers
          </button>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-900 border-l-4 border-red-600 text-red-400 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}

        {/* Users List */}
        {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.length === 0 ? (
              <div className="col-span-2 text-center py-10 text-gray-500">
                {activeTab === 'following' 
                  ? "You're not following anyone yet." 
                  : "You don't have any followers yet."}
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="bg-gray-900 rounded-xl shadow-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-700">
                      <img
                          src={user.avatar_url}
                          alt={user.login}
                          className="object-cover w-full h-full"
                      />
                      </div>
                    <div>
                      <a 
                        href={user.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-white hover:text-indigo-400"
                      >
                        {user.login}
                      </a>
                    </div>
                  </div>
                  {/* {activeTab === 'followers' ? (
                    <button
                      onClick={() => handleFollow(user.login)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-md bg-indigo-800 text-indigo-200 hover:bg-indigo-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="17" y1="11" x2="17" y2="17"></line><line x1="14" y1="14" x2="20" y2="14"></line></svg>
                      Follow
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnfollow(user.login)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-md bg-red-800 text-red-200 hover:bg-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 w-4 h-4"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="17" y1="14" x2="23" y2="14"></line></svg>
                      Unfollow
                    </button>
                  )} */}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
                  </div>
  );
};