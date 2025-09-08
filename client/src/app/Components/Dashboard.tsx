"use client";
import { FiGithub, FiGitPullRequest, FiStar, FiEye, FiClock, FiCode } from 'react-icons/fi';
import { Bar } from 'react-chartjs-2';
import Loader from '../utils/Loader';
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth`, {
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

  interface ContributionData {
    date: string;
    type: 'pr' | 'commit' | 'issue' | 'review';
    repo: string;
  }

  const fetchAllPages = async <T,>(
    url: string,
    accessToken: string,
    maxPages = 10
  ): Promise<T[]> => {
    let allItems: T[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= maxPages) {
      const response = await axios.get<T[]>(
        `${url}${url.includes('?') ? '&' : '?'}per_page=100&page=${page}`,
        { headers: { Authorization: `token ${accessToken}` } }
      );

      allItems = [...allItems, ...response.data];
      
      // Stop if we got fewer items than requested (reached the end)
      if (response.data.length < 100) {
        hasMore = false;
      }
      
      page++;
    }

    return allItems;
  };

  const fetchUserData = async () => {
    if (!accessToken || !fetchedUser) {
      console.error("Access token or fetched user is missing");
      return;
    }

    try {
      setLoading(true);
      const username = fetchedUser.login;
      
      // 1. Fetch all repositories
      const repos = await fetchAllPages<{name: string; stargazers_count: number; full_name: string; private: boolean}>(
        `https://api.github.com/user/repos`,
        accessToken,
        10 // Max 1000 repos (10 pages * 100 per page)
      );

      // 2. Calculate total stars
      const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      setTotalStars(totalStars);

      // 3. Fetch PRs, commits, and issues for each repository
      const contributions: ContributionData[] = [];
      let pullRequests: any[] = [];

      // Process repositories in parallel with concurrency limit
      const processRepos = async (repoList: typeof repos) => {
        const results = await Promise.all(
          repoList.map(async (repo) => {
            if (repo.private) return null; // Skip private repos for now

            // Fetch PRs
            const prs = await fetchAllPages<any>(
              `https://api.github.com/repos/${repo.full_name}/pulls?state=all&author=${username}`,
              accessToken,
              2 // Max 200 PRs per repo
            );

            // Fetch commits (only for the last year to reduce load)
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            const commits = await fetchAllPages<any>(
              `https://api.github.com/repos/${repo.full_name}/commits?author=${username}&since=${oneYearAgo.toISOString()}`,
              accessToken,
              2 // Max 200 commits per repo
            );

            // Process PRs
            prs.forEach(pr => {
              contributions.push({
                date: pr.created_at,
                type: 'pr',
                repo: repo.full_name
              });
            });

            // Process commits
            commits.forEach(commit => {
              if (commit.author && commit.author.login === username) {
                contributions.push({
                  date: commit.commit.author.date,
                  type: 'commit',
                  repo: repo.full_name
                });
              }
            });

            return prs;
          })
        );

        return results.flat().filter(Boolean);
      };

      // Process repositories in chunks to avoid rate limiting
      const chunkSize = 5;
      for (let i = 0; i < repos.length; i += chunkSize) {
        const chunk = repos.slice(i, i + chunkSize);
        const chunkResults = await processRepos(chunk);
        pullRequests = [...pullRequests, ...chunkResults];
      }

      // 4. Set pull requests
      
      // 5. Process contributions for the chart
      const contributionsByMonth = contributions.reduce((acc, contribution) => {
        const date = new Date(contribution.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[monthYear] = (acc[monthYear] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Generate labels for the last 12 months
      const months = [];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const month = d.getMonth();
        const year = d.getFullYear();
        const monthYear = `${year}-${String(month + 1).padStart(2, '0')}`;
        months.push({
          label: `${monthNames[month]} '${String(year).slice(2)}`,
          value: contributionsByMonth[monthYear] || 0,
          monthYear
        });
      }

      setChartData({
        labels: months.map(m => m.label),
        datasets: [
          {
            label: 'Contributions',
            data: months.map(m => m.value),
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1,
            borderRadius: 4,
            barPercentage: 0.8,
          },
        ],
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
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
    if (!accessToken ) return;

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
    fetchUserData();
  }, [fetchedUser])

  useEffect(() => {
    if (!accessToken || !fetchedUser) return;
    fetchEvents();
  }, [fetchedUser])

  useEffect(() => {
    console.log("User pull requests - ", userPullRequest)
    console.log("User Events - ", userEvents)
  }, [userPullRequest,userEvents])


  // useEffect(() => {
  //   console.log("New PUll ",userPullRequest)
  // }, [userPullRequest])


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
      {loading ? (<Loader />) : (<div className="min-h-screen bg-black text-white p-4 md:p-8">
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

export default Dashboard;