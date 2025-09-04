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
import { format, subDays, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

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
  const [totalContributions, setTotalContributions] = useState(0);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setAccessToken(token);
    
    if (token) {
      // Simulate fetching data - replace with actual API calls
      setTimeout(() => {
        const mockData = generateMockData();
        setActivityData(mockData);
        calculateMetrics(mockData);
        setLoading(false);
      }, 1000);
    }
  }, []);

  const generateMockData = (): ActivityData[] => {
    const days = 30;
    const today = new Date();
    const dateArray = eachDayOfInterval({
      start: subDays(today, days - 1),
      end: today,
    });

    return dateArray.map((date, index) => ({
      date: date.toISOString(),
      commits: Math.floor(Math.random() * 15) * (Math.random() > 0.3 ? 1 : 0), // Some days with 0 commits
      pullRequests: Math.floor(Math.random() * 5) * (Math.random() > 0.6 ? 1 : 0),
      issues: Math.floor(Math.random() * 3) * (Math.random() > 0.7 ? 1 : 0),
      codeReviews: Math.floor(Math.random() * 8) * (Math.random() > 0.5 ? 1 : 0),
    }));
  };

  const calculateMetrics = (data: ActivityData[]) => {
    // Calculate current streak
    let streak = 0;
    const today = new Date();
    let currentDate = new Date(today);
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = data.find(d => d.date.startsWith(dateStr));
      
      if (dayData && (dayData.commits > 0 || dayData.pullRequests > 0)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    setCurrentStreak(streak);

    // Calculate longest streak
    let maxStreak = 0;
    let currentRun = 0;
    
    data.forEach(day => {
      if (day.commits > 0 || day.pullRequests > 0) {
        currentRun++;
        maxStreak = Math.max(maxStreak, currentRun);
      } else {
        currentRun = 0;
      }
    });
    setLongestStreak(maxStreak);

    // Calculate daily average
    const totalDays = data.length;
    const totalActivity = data.reduce((sum, day) => sum + day.commits + day.pullRequests, 0);
    setDailyAverage(parseFloat((totalActivity / totalDays).toFixed(1)));

    // Most active hour (simplified for demo)
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const hourActivity = hours.map(hour => ({
      hour,
      count: Math.floor(Math.random() * 20) * (hour > 8 && hour < 20 ? 2 : 1)
    }));
    const mostActive = hourActivity.reduce((max, curr) => 
      curr.count > max.count ? curr : max, { hour: 0, count: 0 });
    
    setMostActiveHour(`${mostActive.hour}:00 - ${mostActive.hour + 1}:00`);
    
    // Most active day
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayActivity = days.map((day, index) => ({
      day,
      count: Math.floor(Math.random() * 15) * (index < 5 ? 2 : 1) // Weekdays more active
    }));
    const mostActiveDayData = dayActivity.reduce((max, curr) => 
      curr.count > max.count ? curr : max, { day: '', count: 0 });
    
    setMostActiveDay(mostActiveDayData.day);
    
    // Total contributions
    setTotalContributions(totalActivity);
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
                value={mostActiveHour}
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
                    {Math.round((activityData.reduce((sum, day) => sum + day.commits, 0) / totalContributions) * 100)}%
                  </div>
                  <div className="text-sm text-gray-400">Commits</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {Math.round((activityData.reduce((sum, day) => sum + day.pullRequests, 0) / totalContributions) * 100)}%
                  </div>
                  <div className="text-sm text-gray-400">Pull Requests</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">
                    {Math.round((activityData.reduce((sum, day) => sum + day.issues, 0) / totalContributions) * 100)}%
                  </div>
                  <div className="text-sm text-gray-400">Issues</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.round((activityData.reduce((sum, day) => sum + day.codeReviews, 0) / totalContributions) * 100)}%
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