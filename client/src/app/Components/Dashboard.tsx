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
import React from 'react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [fetchedUser, setfetchedUser] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [userPullRequest, setUserPullRequest] = useState<any[]>([])
  const [totalStars, setTotalStars] = useState<number>(0)
  const[userEvents, setUserEvents] = useState<any[]>([])
  const [contributionData, setContributionData] = useState<{weeks: Array<{w: number, a: number, d: number, c: number}>}>({ weeks: [] });
  const [chartData, setChartData] = useState<any>(null);

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

  const fetchContributionData = async (username: string) => {
    try {
      const response = await axios.get(`https://api.github.com/users/${username}/events`);
      const events = response.data;
      
      // Process events to get contribution data
      const contributions = events.reduce((acc: any, event: any) => {
        const date = new Date(event.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // Get last 30 days of data
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return d.toISOString().split('T')[0];
      });

      // Format data for chart
      const labels = last30Days.map(date => {
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      });

      const data = last30Days.map(date => contributions[date] || 0);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Contributions',
            data,
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1,
            borderRadius: 4,
            barPercentage: 0.8,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching contribution data:', error);
    }
  };

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
      await fetchContributionData(response.login);
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

  useEffect(() => {
    if (!accessToken) return;
    else {
      console.log("Access token - ", accessToken)
      console.log("Fetching user events")
    }
  }, [accessToken])

  useEffect(() => {
    console.log("User pull requests - ", userPullRequest)
    console.log("User Events - ", userEvents)
    userEvents.forEach((event: any) => {
      console.log(event.type)
    })
  }, [userPullRequest,userEvents])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#9CA3AF',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
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
                src={fetchedUser.avatar_url}
                alt={fetchedUser.name}
                className="w-24 h-24 rounded-full border-4 border-indigo-900/50 mb-4"
              />
              <h2 className="text-xl font-mono text-white">{fetchedUser.login}</h2>
              <p className="text-gray-400 mb-2">@{fetchedUser.login}</p>
              {fetchedUser.bio ? (<p className="text-sm text-gray-400 text-center mb-4">{fetchedUser.bio}</p>) : (<p className="text-sm text-gray-400 text-center mb-4">No Bio Found</p>)}

              <div className="w-full space-y-3 mt-4">
                <div className="flex items-center text-sm">
                  <FiGithub className="mr-2 text-gray-400" />
                  <span className="text-gray-300">{fetchedUser.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <FiClock className="mr-2 text-gray-400" />
                  <span className="text-gray-300">
                    Joined {new Date(fetchedUser.created_at).toDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contributions Graph */}
        <div className="bg-[lab(9 -0.05 -2.33)] p-6 rounded-lg shadow-sm border border-gray-800">
          <h2 className="text-lg font-mono mb-4 text-white">Contributions</h2>
          <div className="h-64">
            {chartData ? (
              <Bar
                data={chartData}
                options={chartOptions}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Loading contribution data...</p>
              </div>
            )}
          </div>
        </div>
      </div>)}

    </>
  );
};

export default React.memo(Dashboard);