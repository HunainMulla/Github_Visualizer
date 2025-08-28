"use client";

import React from 'react';
import { FiGithub, FiGitPullRequest, FiStar, FiEye, FiClock, FiCode } from 'react-icons/fi';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Dummy data
const userData = {
  name: 'John Doe',
  username: 'johndoe',
  email: 'john.doe@example.com',
  avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
  joinedDate: 'Jan 2020',
  bio: 'Full-stack developer | Open source enthusiast | Building cool stuff',
  stats: {
    publicRepos: 24,
    privateRepos: 8,
    followers: 128,
    following: 42,
    pullRequests: 56,
    stars: 312,
  },
  recentActivity: [
    { id: 1, type: 'push', repo: 'web-project', time: '2 hours ago', branch: 'main' },
    { id: 2, type: 'pull_request', repo: 'api-service', action: 'opened', time: '5 hours ago' },
    { id: 3, type: 'star', repo: 'awesome-repo', action: 'starred', time: '1 day ago' },
    { id: 4, type: 'commit', repo: 'mobile-app', message: 'Fix login flow', time: '1 day ago' },
    { id: 5, type: 'issue', repo: 'docs', action: 'opened', time: '2 days ago' },
  ],
  pinnedRepos: [
    { id: 1, name: 'web-project', description: 'Modern web application with React', stars: 45, language: 'TypeScript' },
    { id: 2, name: 'api-service', description: 'REST API service for the application', stars: 23, language: 'Node.js' },
    { id: 3, name: 'mobile-app', description: 'Cross-platform mobile application', stars: 67, language: 'React Native' },
  ],
  contributions: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    data: [12, 19, 8, 15, 22, 18, 25, 12, 19, 30, 25, 15],
  },
};

const Dashboard = () => {
  const chartData = {
    labels: userData.contributions.labels,
    datasets: [
      {
        label: 'Monthly Contributions',
        data: userData.contributions.data,
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'push':
        return <FiCode className="text-green-500" />;
      case 'pull_request':
        return <FiGitPullRequest className="text-purple-500" />;
      case 'star':
        return <FiStar className="text-yellow-500" />;
      case 'issue':
        return <FiGithub className="text-red-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-300">Welcome back, {userData.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[lab(9 -0.05 -2.33)] p-6 rounded-lg shadow-sm border border-gray-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-900/30 text-indigo-400">
              <FiGithub size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Public Repos</p>
              <p className="text-2xl font-semibold text-white">{userData.stats.publicRepos}</p>
            </div>
          </div>
        </div>

        <div className="bg-[lab(9 -0.05 -2.33)] p-6 rounded-lg shadow-sm border border-gray-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-900/30 text-purple-400">
              <FiGitPullRequest size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Pull Requests</p>
              <p className="text-2xl font-semibold text-white">{userData.stats.pullRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-[lab(9 -0.05 -2.33)] p-6 rounded-lg shadow-sm border border-gray-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-900/30 text-yellow-400">
              <FiStar size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Stars</p>
              <p className="text-2xl font-semibold text-white">{userData.stats.stars}</p>
            </div>
          </div>
        </div>

        <div className="bg-[lab(9 -0.05 -2.33)] p-6 rounded-lg shadow-sm border border-gray-800">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-900/30 text-green-400">
              <FiEye size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Private Repos</p>
              <p className="text-2xl font-semibold text-white">{userData.stats.privateRepos}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-[lab(9 -0.05 -2.33)] p-6 rounded-lg shadow-sm border border-gray-800">
          <h2 className="text-lg font-semibold mb-4 text-white">Recent Activity</h2>
          <div className="space-y-4">
            {userData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start pb-4 border-b border-gray-800 last:border-0 last:pb-0">
                <div className="mt-1 mr-3">
                  <div className="p-2 rounded-full bg-gray-800">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {activity.type === 'push' && (
                      <span>Pushed to <span className="font-semibold">{activity.repo}</span> on <span className="font-mono text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">{activity.branch}</span></span>
                    )}
                    {activity.type === 'pull_request' && (
                      <span>Opened a pull request in <span className="font-semibold">{activity.repo}</span></span>
                    )}
                    {activity.type === 'star' && (
                      <span>Starred <span className="font-semibold">{activity.repo}</span></span>
                    )}
                    {activity.type === 'issue' && (
                      <span>Opened an issue in <span className="font-semibold">{activity.repo}</span></span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Profile */}
        <div className="bg-[lab(9 -0.05 -2.33)] p-6 rounded-lg shadow-sm border border-gray-800">
          <div className="flex flex-col items-center">
            <img 
              src={userData.avatar} 
              alt={userData.name} 
              className="w-24 h-24 rounded-full border-4 border-indigo-900/50 mb-4"
            />
            <h2 className="text-xl font-semibold text-white">{userData.name}</h2>
            <p className="text-gray-400 mb-2">@{userData.username}</p>
            <p className="text-sm text-gray-400 text-center mb-4">{userData.bio}</p>
            
            <div className="w-full space-y-3 mt-4">
              <div className="flex items-center text-sm">
                <FiGithub className="mr-2 text-gray-400" />
                <span className="text-gray-300">{userData.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <FiClock className="mr-2 text-gray-400" />
                <span className="text-gray-300">Joined {userData.joinedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Repositories */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-white">Pinned Repositories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userData.pinnedRepos.map((repo) => (
            <div key={repo.id} className="bg-[lab(9 -0.05 -2.33)] p-4 rounded-lg shadow-sm border border-gray-800 hover:border-indigo-500/50 transition-all">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-indigo-400">{repo.name}</h3>
                <span className="flex items-center text-sm text-gray-400">
                  <FiStar className="mr-1 text-yellow-400" /> {repo.stars}
                </span>
              </div>
              <p className="text-sm text-gray-300 mt-1">{repo.description}</p>
              <div className="mt-3 flex items-center">
                <span className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></span>
                <span className="text-xs text-gray-400">{repo.language}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contributions Graph */}
      <div className="bg-[lab(9 -0.05 -2.33)] p-6 rounded-lg shadow-sm border border-gray-800">
        <h2 className="text-lg font-semibold mb-4 text-white">Contributions</h2>
        <div className="h-64">
          <Bar 
            data={chartData} 
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: {
                  ...chartOptions.scales.y,
                  ticks: {
                    color: '#9CA3AF',
                  },
                  grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                  },
                },
                x: {
                  ...chartOptions.scales.x,
                  ticks: {
                    color: '#9CA3AF',
                  },
                  grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                  },
                },
              },
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;