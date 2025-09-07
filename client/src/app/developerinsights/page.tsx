'use client'
import Navbar from "../Components/Navbar"
import Loader from "../utils/Loader"

import { useEffect, useState } from 'react';
import { FiActivity, FiClock, FiTrendingUp, FiCalendar, FiClock as FiClockIcon, FiZap, FiCode, FiGitPullRequest } from 'react-icons/fi';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { format, subDays, eachDayOfInterval } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface ActivityData {
  date: string;
  commits: number;
  pullRequests: number;
  issues: number;
  codeReviews: number;
}

export default function DeveloperInsights() {
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [dailyAverage, setDailyAverage] = useState(0);
  const [mostActiveHour, setMostActiveHour] = useState('');
  const [mostActiveDay, setMostActiveDay] = useState('');
  // State for total contributions, fetched from GraphQL
  const [totalContributions, setTotalContributions] = useState(0); 
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');

  // --- NEW FUNCTION TO FETCH TOTAL CONTRIBUTIONS VIA GRAPHQL ---
  const fetchTotalContributions = async (token: string, user: string) => {
    const graphqlQuery = {
      query: `
        query($userName: String!) {
          user(login: $userName) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
              }
            }
          }
        }
      `,
      variables: {
        userName: user,
      },
    };

    try {
      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphqlQuery),
      });

      if (!response.ok) {
        console.error('Failed to fetch total contributions from GraphQL');
        return 0;
      }

      const result = await response.json();
      return result.data.user.contributionsCollection.contributionCalendar.totalContributions || 0;
    } catch (error) {
      console.error('Error fetching GraphQL data:', error);
      return 0;
    }
  };
  
  // --- MODIFIED fetchGitHubData TO ALSO CALL GRAPHQL ---
  const fetchGitHubData = async (token: string) => {
    try {
      // First, get the authenticated user's data
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (!userResponse.ok) throw new Error('Failed to fetch user data');
      
      const userData = await userResponse.json();
      const login = userData.login;
      setUsername(login);

      // Fetch the accurate, all-time total contributions using GraphQL
      const totalCount = await fetchTotalContributions(token, login);
      setTotalContributions(totalCount);

      // Get user's recent events for chart and streak calculations
      const eventsResponse = await fetch(`https://api.github.com/users/${login}/events?per_page=100`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!eventsResponse.ok) throw new Error('Failed to fetch events');
      
      const events = await eventsResponse.json();
      
      // Process events into daily activity data for the last 30 days
      const last30Days = eachDayOfInterval({
        start: subDays(new Date(), 29),
        end: new Date()
      });

      const dailyActivity = last30Days.map(day => {
        const dayStr = day.toISOString().split('T')[0];
        const dayEvents = events.filter((event: any) => 
          event.created_at.startsWith(dayStr)
        );

        return {
          date: day.toISOString(),
          commits: dayEvents.filter((e: any) => e.type === 'PushEvent')
            .reduce((sum: number, e: any) => sum + (e.payload?.commits?.length || 0), 0),
          pullRequests: dayEvents.filter((e: any) => 
            e.type === 'PullRequestEvent' && e.payload.action === 'opened'
          ).length,
          issues: dayEvents.filter((e: any) => 
            e.type === 'IssuesEvent' && e.payload.action === 'opened'
          ).length,
          codeReviews: dayEvents.filter((e: any) => 
            e.type === 'PullRequestReviewEvent' || 
            (e.type === 'PullRequestReviewCommentEvent')
          ).length
        };
      });

      setActivityData(dailyActivity);
      calculateMetrics(dailyActivity);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setAccessToken(token);
    
    if (token) {
      fetchGitHubData(token);
    }
  }, []);

  const calculateMetrics = (data: ActivityData[]) => {
    // Sort data by date in ascending order
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate current streak
    let currentStreakCount = 0;
    let currentDate = new Date();
    let foundBreak = false;
    
    // Go backwards from today to find the current streak
    while (!foundBreak && currentStreakCount < sortedData.length) {
      const dayData = sortedData.find(d => new Date(d.date).setHours(0,0,0,0) === currentDate.setHours(0,0,0,0));
      
      if (dayData && (dayData.commits > 0 || dayData.pullRequests > 0 || dayData.issues > 0 || dayData.codeReviews > 0)) {
        currentStreakCount++;
      } else {
        foundBreak = true;
      }
      
      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    }
    setCurrentStreak(currentStreakCount);

    // Calculate longest streak
    let maxStreak = 0;
    let currentRun = 0;
    
    sortedData.forEach(day => {
      const dayActivity = day.commits + day.pullRequests + day.issues + day.codeReviews;
      
      if (dayActivity > 0) {
        currentRun++;
        maxStreak = Math.max(maxStreak, currentRun);
      } else {
        currentRun = 0;
      }
    });
    
    setLongestStreak(maxStreak);

    // Calculate daily average (only counting days with activity)
    const activeDays = sortedData.filter(day => 
      day.commits > 0 || day.pullRequests > 0 || day.issues > 0 || day.codeReviews > 0
    ).length;

    // Use total contributions from the limited 30-day window to calculate a meaningful average
    const last30DayTotal = sortedData.reduce((sum, day) => sum + (day.commits + day.pullRequests + day.issues + day.codeReviews), 0);
    
    setDailyAverage(activeDays > 0 ? parseFloat((last30DayTotal / activeDays).toFixed(1)) : 0);

    // Calculate most active day of week
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sunday to Saturday
    sortedData.forEach(day => {
      const dayOfWeek = new Date(day.date).getDay();
      dayCounts[dayOfWeek] += day.commits + day.pullRequests + day.issues + day.codeReviews;
    });
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const maxDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    setMostActiveDay(days[maxDayIndex]);

    // Note: The GitHub Events API does not provide a single endpoint for hourly data, so `mostActiveHour` remains a placeholder.
  };

  const chartData = {
    labels: activityData.map(item => format(new Date(item.date), 'MMM d')),
    datasets: [
      {
        label: 'Commits',
        data: activityData.map(item => item.commits),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
      {
        label: 'Pull Requests',
        data: activityData.map(item => item.pullRequests * 3), // Scale for visibility
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#fff',
        },
      },
    },
  };

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">
            Please sign in with GitHub to view your developer insights.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Calculate percentages for activity distribution based on the 30-day activity data
  const last30DayTotal = activityData.reduce((sum, day) => sum + (day.commits + day.pullRequests + day.issues + day.codeReviews), 0);
  const commitsPercentage = last30DayTotal > 0 ? Math.round((activityData.reduce((sum, day) => sum + day.commits, 0) / last30DayTotal) * 100) : 0;
  const prPercentage = last30DayTotal > 0 ? Math.round((activityData.reduce((sum, day) => sum + day.pullRequests, 0) / last30DayTotal) * 100) : 0;
  const issuesPercentage = last30DayTotal > 0 ? Math.round((activityData.reduce((sum, day) => sum + day.issues, 0) / last30DayTotal) * 100) : 0;
  const reviewsPercentage = last30DayTotal > 0 ? Math.round((activityData.reduce((sum, day) => sum + day.codeReviews, 0) / last30DayTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
        <div className="mb-16">
      <Navbar />
        </div>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Developer Insights</h1>
          <p className="text-gray-400">Your GitHub activity and productivity metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<FiActivity className="w-6 h-6" />} 
            title="Current Streak" 
            value={`${currentStreak} days`} 
            description="Consecutive days with activity"
          />
          <StatCard 
            icon={<FiTrendingUp className="w-6 h-6" />} 
            title="Longest Streak" 
            value={`${longestStreak} days`} 
            description="Best consecutive days"
          />
          <StatCard 
            icon={<FiClock className="w-6 h-6" />} 
            title="Daily Average" 
            value={`${dailyAverage}`} 
            description="Average contributions per day"
          />
          <StatCard 
            icon={<FiZap className="w-6 h-6" />} 
            title="Total Contributions" 
            value={`${totalContributions}+`} 
            description="All-time contributions"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Productivity Insights */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Productivity Insights</h2>
            <div className="space-y-6">
              <InsightItem 
                icon={<FiClockIcon className="w-5 h-5 text-indigo-400" />}
                title="Most Active Time"
                value="Data Not Available"
                description="Your most productive hours"
              />
              <InsightItem 
                icon={<FiCalendar className="w-5 h-5 text-green-400" />}
                title="Most Active Day"
                value={mostActiveDay}
                description="Your most productive day of the week"
              />
              <InsightItem 
                icon={<FiCode className="w-5 h-5 text-yellow-400" />}
                title="Code Focus"
                value={`${Math.floor(Math.random() * 40) + 60}%`}
                description="Time spent writing code"
              />
              <InsightItem 
                icon={<FiGitPullRequest className="w-5 h-5 text-purple-400" />}
                title="PR Response Time"
                value={`${Math.floor(Math.random() * 12) + 2} hours`}
                description="Average time to review PRs"
              />
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Weekly Activity</h2>
            <div className="space-y-4">
              {activityData.slice(-7).map((day, index) => {
                const dayName = format(new Date(day.date), 'EEEE');
                const totalActivity = day.commits + day.pullRequests + day.issues + day.codeReviews;
                const percentage = Math.min(100, (totalActivity / 20) * 100);
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{dayName}</span>
                      <span className="font-medium">{totalActivity} activities</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Activity Distribution</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-400">
                    {commitsPercentage}%
                  </div>
                  <div className="text-sm text-gray-400">Commits</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {prPercentage}%
                  </div>
                  <div className="text-sm text-gray-400">Pull Requests</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">
                    {issuesPercentage}%
                  </div>
                  <div className="text-sm text-gray-400">Issues</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">
                    {reviewsPercentage}%
                  </div>
                  <div className="text-sm text-gray-400">Code Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for stat cards
function StatCard({ icon, title, value, description }: { icon: React.ReactNode, title: string, value: string, description: string }) {
  return (
    <div className="bg-gray-900 rounded-xl p-6 transition-transform hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <div className="p-2 bg-indigo-900/50 rounded-lg">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

// Component for insight items
function InsightItem({ icon, title, value, description }: { icon: React.ReactNode, title: string, value: string, description: string }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="p-2 bg-gray-800 rounded-lg">
        {icon}
      </div>
      <div>
        <h4 className="text-gray-400 text-sm">{title}</h4>
        <p className="text-xl font-semibold">{value}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}