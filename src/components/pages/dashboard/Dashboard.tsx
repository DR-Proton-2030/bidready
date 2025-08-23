'use client';

import React from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  MoreHorizontal,
  Clock,
  Target,
  Users,
  Brain
} from 'lucide-react';
import StatCard from '@/components/shared/statCard/StatCard';
import ActivityItem from '@/components/shared/activityItem/ActivityItem';
import { DASHBOARD_STATS, RECENT_ACTIVITIES, DASHBOARD_TEXT } from '@/constants/dashboard/dashboard.constant';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Balance Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Balance</p>
            <div className="flex items-baseline space-x-2">
              <h1 className="text-4xl font-bold text-gray-900">$3,200</h1>
              <span className="text-2xl text-gray-400">.80</span>
              <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs font-medium">85.66%</span>
              </div>
            </div>
          </div>
          <select className="text-sm text-gray-600 border-none bg-transparent focus:outline-none">
            <option>All time</option>
            <option>This month</option>
            <option>This week</option>
          </select>
        </div>
        
        {/* Chart placeholder */}
        <div className="h-40 relative">
          <svg className="w-full h-full" viewBox="0 0 400 160">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path
              d="M 0 120 Q 50 100 100 90 T 200 80 T 300 60 T 400 40"
              stroke="#3b82f6"
              strokeWidth="3"
              fill="none"
              className="drop-shadow-sm"
            />
            <path
              d="M 0 120 Q 50 100 100 90 T 200 80 T 300 60 T 400 40 L 400 160 L 0 160 Z"
              fill="url(#gradient)"
            />
            
            {/* Data point */}
            <circle cx="300" cy="60" r="4" fill="#3b82f6" className="shadow-lg"/>
            <rect x="260" y="45" width="80" height="25" rx="4" fill="white" className="shadow-lg"/>
            <text x="275" y="55" fontSize="10" fill="#374151">26 Feb 2024</text>
            <text x="275" y="67" fontSize="10" fill="#374151" fontWeight="bold">$2,867.34</text>
          </svg>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DASHBOARD_STATS.map((stat) => (
          <div key={stat.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                {stat.color === 'blue' && <Target className={`w-6 h-6 ${stat.textColor}`} />}
                {stat.color === 'green' && <TrendingUp className={`w-6 h-6 ${stat.textColor}`} />}
                {stat.color === 'purple' && <Users className={`w-6 h-6 ${stat.textColor}`} />}
                {stat.color === 'orange' && <Clock className={`w-6 h-6 ${stat.textColor}`} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Tokens */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Top tokens</h2>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
              See all
            </button>
          </div>
          
          <div className="space-y-4">
            {[
              { name: 'Ripple', symbol: 'XRP', price: '$0.4831', change: '+36.68%', positive: true },
              { name: 'Ethereum', symbol: 'ETH', price: '$2,968.31', change: '+15.66%', positive: true },
              { name: 'Solana', symbol: 'SOL', price: '$132.38', change: '-5.68%', positive: false },
            ].map((token, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {token.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{token.name}</p>
                    <p className="text-sm text-gray-500">{token.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{token.price}</p>
                  <p className={`text-sm ${token.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {token.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Greed Index */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Greed Index</h2>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
              See all
            </button>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#greedGradient)"
                  strokeWidth="3"
                  strokeDasharray="82, 100"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="greedGradient">
                    <stop offset="0%" stopColor="#ef4444"/>
                    <stop offset="25%" stopColor="#f97316"/>
                    <stop offset="50%" stopColor="#eab308"/>
                    <stop offset="75%" stopColor="#84cc16"/>
                    <stop offset="100%" stopColor="#22c55e"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">82</span>
                <span className="text-sm text-gray-500">Greed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">{DASHBOARD_TEXT.recentActivityTitle}</h2>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
              See all
            </button>
          </div>
          <div className="space-y-4">
            {RECENT_ACTIVITIES.map((activity) => (
              <div key={activity.id} className={`border-l-3 ${activity.borderColor} pl-4`}>
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NeuraAI Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Trade smarter with NeuraNet AI</h3>
            </div>
            <p className="text-blue-100 text-sm mb-4">
              Automate trades based on user-defined criteria, using AI algorithms to time trades optimally.
            </p>
            <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors">
              Upgrade to Pro
            </button>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Brain className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
