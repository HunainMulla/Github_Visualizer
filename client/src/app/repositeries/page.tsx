"use client"
import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
}

export default function Repositories() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'sources' | 'forks' | 'archived'>('all');

  const accessToken = localStorage.getItem('access_token');

  useEffect(() => {
    if(!accessToken) window.location.href = '/login';


    const fetchRepos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('No access token found');

        const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (!response.ok) throw new Error(`GitHub API error: ${response.statusText}`);

        const data = await response.json();
        setRepos(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching repositories:', err);
        setError('Failed to load repositories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  const filterRepos = (repo: Repository) => {
    switch (activeFilter) {
      case 'sources':
        return !repo.fork && !repo.private;
      case 'forks':
        return repo.fork;
      case 'archived':
        return repo.archived;
      default:
        return true;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className='flex flex-col'>
      <div className=''>   
        <Navbar />
      </div>
      <div className="min-h-screen bg-black text-white p-4 md:p-8 mt-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-indigo-400">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            Repositories
          </h1>

          {/* Filters */}
          <div className="flex space-x-4 mb-6 border-b border-gray-700 pb-4">
            {[
              { id: 'all' as const, label: 'All' },
              { id: 'sources' as const, label: 'Sources' },
              { id: 'forks' as const, label: 'Forks' },
              { id: 'archived' as const, label: 'Archived' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 text-sm font-medium ${
                  activeFilter === filter.id
                    ? 'text-indigo-400 border-b-2 border-indigo-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
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

          {/* Repositories List */}
          {!loading && !error && (
            <div className="space-y-4">
              {repos.filter(filterRepos).length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p>No repositories found.</p>
                </div>
              ) : (
                repos.filter(filterRepos).map((repo) => (
                  <div key={repo.id} className="bg-gray-900 rounded-xl p-6 hover:bg-gray-800 transition-colors duration-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold text-indigo-400 hover:underline">
                          <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                            {repo.name}
                          </a>
                          {repo.private && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded-full">
                              Private
                            </span>
                          )}
                        </h2>
                        {repo.description && (
                          <p className="mt-2 text-gray-300">{repo.description}</p>
                        )}
                        <div className="flex items-center mt-4 space-x-6 text-sm text-gray-400">
                          {repo.language && (
                            <div className="flex items-center">
                              <span className="w-3 h-3 rounded-full bg-indigo-500 mr-1"></span>
                              {repo.language}
                            </div>
                          )}
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                            </svg>
                            {repo.stargazers_count.toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                            </svg>
                            {repo.forks_count.toLocaleString()}
                          </div>
                          <div>
                            Updated on {formatDate(repo.updated_at)}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700">
                          Star
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}