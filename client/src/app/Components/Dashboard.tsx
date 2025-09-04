"use client";

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
import { useState, useEffect } from 'react';
import axios from 'axios';

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
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [fetchedUser, setfetchedUser] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [userPullRequest, setUserPullRequest] = useState<any[]>([])
  const [totalStars, setTotalStars] = useState<number>(0)
  const[userEvents, setUserEvents] = useState<any[]>([])
  const handleAccess = async (code: string | null) => {
    if (!code) {
      console.error("No code provided");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to authenticate');
      }

      const data = await response.json();
      if (data) {
        setAccessToken(data.access_token)
        localStorage.setItem("access_token", data.access_token)
        localStorage.setItem("jwt_token", data.jwt_token)
      }
    } catch (error) {
      console.error("Authentication error:", error);
    }
  }


  const fetchEvents = async () => {
    if (!accessToken || !fetchedUser) {
      console.error("Access token or fetched user is missing");
      return;
    };
    try {
      const response = await axios.get(`https://api.github.com/users/${fetchedUser.login}/events?per_page=100`, {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      });
      const data = await response.data; // no await needed
      setUserEvents(data)
      setUserPullRequest(data.filter((event: any) => event.type === "PullRequestEvent"))
      const totalStars: number = data.reduce(
        (sum: number, repo: any) => sum + repo.stargazers_count,
        0
      );
      console.log("Total stars:", totalStars);
      setTotalStars(totalStars)
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {

    const accessToken = localStorage.getItem("access_token")
    if (accessToken) {
      setAccessToken(accessToken)
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const code: string | null = params.get("code");
    if (!code) {
      return;
    }
    handleAccess(code)

  }, [])


  const getUserData = async () => {
    if (!accessToken) return;

    try {
      const data = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      })

      const response = await data.json()
      setfetchedUser(response)
      setLoading(false)
    }
    catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token")
    const jwtToken = localStorage.getItem("jwt_token")
    if (!accessToken) return;
    getUserData();
  }, [accessToken])


  useEffect(() => {
    if (!fetchedUser) return;
    console.log("User data from api - ", fetchedUser)
    fetchEvents();

  }, [fetchedUser])


  //For debugging purpose 
  useEffect(() => {
    if (!accessToken) return;
    else {
      console.log("Access token - ", accessToken)
      console.log("Fetching user events")
    }
  }, [accessToken])


  //test useEffect
  useEffect(() => {
    console.log("User pull requests - ", userPullRequest)
    console.log("User Events - ", userEvents)
    userEvents.forEach((event: any) => {
      console.log(event.type)
    })


  }, [userPullRequest,userEvents])


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
    <>
      {loading ? (<div className="min-h-screen flex justify-center items-center text-white">
        Loading...
      </div>) : (<div className="min-h-screen bg-black text-white p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-center items-center">
          <h1 className="text-3xl font-semibold font-mono text-white">Dashboard</h1>
          <p className="text-gray-300 font-mono">Welcome back, {fetchedUser.login}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[lab(9 -0.05 -2.33)] p-6 rounded-lg shadow-sm border border-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-900/30 text-indigo-400">
                <FiGithub size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-mono text-gray-400">Public Repos</p>
                <p className="text-2xl font-mono text-white">{fetchedUser.public_repos}</p>
              </div>
            </div>
          </div>

          <div className="bg-[lab(9 -0.05 -2.33)] p-6 rounded-lg shadow-sm border border-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-900/30 text-purple-400">
                <FiGitPullRequest size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-mono text-gray-400">Pull Requests</p>
                <p className="text-2xl font-mono text-white">{userPullRequest.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-[lab(9 -0.05 -2.33)] p-6 rounded-lg shadow-sm border border-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-900/30 text-yellow-400">
                <FiStar size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-mono text-gray-400">Total Stars</p>
                <p className="text-2xl font-mono text-white">{totalStars || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-[lab(9 -0.05 -2.33)] p-6 rounded-lg shadow-sm border border-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-900/30 text-green-400">
                <FiEye size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-mono text-gray-400">Private Repos</p>
                <p className="text-2xl font-mono text-white">{fetchedUser.total_private_repos}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activity Feed */}
          <div className="lg:col-span-2 bg-[lab(9 -0.05 -2.33)] p-6 rounded-lg shadow-sm border border-gray-800">
            <h2 className="text-lg font-mono mb-4 text-white">Recent Activity</h2>
            <div className="space-y-4">
              {userEvents.slice(0, 5).map((event: any, index: number) => {
                let activityType = '';
                let displayText = '';
                let repoName = event.repo?.name || '';

                // Determine activity type and display text based on event type
                switch(event.type) {
                  case 'PushEvent':
                    activityType = 'push';
                    const branch = event.payload.ref ? event.payload.ref.split('/').pop() : 'main';
                    displayText = `Pushed to ${repoName} on ${branch}`;
                    break;
                  case 'PullRequestEvent':
                    activityType = 'pull_request';
                    displayText = `Opened a pull request in ${repoName}`;
                    break;
                  case 'WatchEvent':
                    activityType = 'star';
                    displayText = `Starred ${repoName}`;
                    break;
                  case 'CreateEvent':
                    activityType = 'commit';
                    displayText = `Created ${event.payload.ref_type} in ${repoName}`;
                    break;
                  default:
                    activityType = 'commit';
                    displayText = `Performed ${event.type} in ${repoName}`;
                }

                return (
                  <div key={`${event.id}-${index}`} className="flex items-start pb-4 border-b border-gray-800 last:border-0 last:pb-0">
                    <div className="mt-1 mr-3">
                      <div className="p-2 rounded-full bg-gray-800">
                        {getActivityIcon(activityType)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-mono text-white">
                        {displayText}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
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
              <h2 className="text-xl font-mono text-white">{fetchedUser.login}</h2>
              <p className="text-gray-400 mb-2">@{userData.username}</p>
              {fetchedUser.bio ? (<p className="text-sm text-gray-400 text-center mb-4">{fetchedUser.bio}</p>) : (<p className="text-sm text-gray-400 text-center mb-4">No Bio Found</p>)}

              <div className="w-full space-y-3 mt-4">
                <div className="flex items-center text-sm">
                  <FiGithub className="mr-2 text-gray-400" />
                  <span className="text-gray-300">{fetchedUser.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <FiClock className="mr-2 text-gray-400" />
                  {/* <span className="text-gray-300">Joined {fetchedUser.created_at.toString().split(" ").slice(0,3)}</span> */}

                  <span className="text-gray-300">
                    Joined {new Date(fetchedUser.created_at).toDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pinned Repositories */}
        <div className="mb-8">
          <h2 className="text-lg font-mono mb-4 text-white">Pinned Repositories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userData.pinnedRepos.map((repo) => (
              <div key={repo.id} className="bg-[lab(9 -0.05 -2.33)] p-4 rounded-lg shadow-sm border border-gray-800 hover:border-indigo-500/50 transition-all">
                <div className="flex justify-between items-start">
                  <h3 className="font-mono text-indigo-400">{repo.name}</h3>
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
          <h2 className="text-lg font-mono mb-4 text-white">Contributions</h2>
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
      </div>)}

    </>
  );
};

export default Dashboard;