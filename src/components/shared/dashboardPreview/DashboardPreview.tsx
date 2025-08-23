"use client";
import React from "react";
import StatCard from "@/components/shared/statCard/StatCard";
import { DASHBOARD_STATS } from "@/constants/auth/signup.constant";
import { Activity, Calendar, TrendingUp } from "lucide-react";

const DashboardPreview: React.FC = () => {
  return (
    <div className="bg-gray-50 p-8 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">BidReady</h2>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-primary font-medium border-b-2 border-primary pb-1">Dashboard</span>
            <span className="text-gray-500">Trans Actions</span>
            <span className="text-gray-500">Investment</span>
            <span className="text-gray-500">Support</span>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* User Welcome */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 sidebar-gradient rounded-full flex items-center justify-center">
          <span className="text-white font-medium">A</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Hello Alex</h3>
          <p className="text-sm text-gray-500">Welcome back to your dashboard</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="premium-card p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-600 rounded-full">
              +10%
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">TOTAL REVENUE</p>
            <p className="text-xl font-bold text-gray-900">{DASHBOARD_STATS.totalRevenue.value}</p>
          </div>
        </div>

        <div className="premium-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-5 h-5 bg-gray-600 rounded"></div>
            <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-600 rounded-full">
              +15%
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">TOTAL BALANCE</p>
            <p className="text-xl font-bold text-gray-900">{DASHBOARD_STATS.totalBalance.value}</p>
          </div>
        </div>

        <div className="premium-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-5 h-5 bg-gray-600 rounded"></div>
            <span className="text-xs font-medium px-2 py-1 bg-red-50 text-red-600 rounded-full">
              -5%
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">TOTAL COST</p>
            <p className="text-xl font-bold text-gray-900">{DASHBOARD_STATS.totalCost.value}</p>
          </div>
        </div>
      </div>

      {/* Expense Chart */}
      <div className="premium-card p-4 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-gray-900">Expense Chart</h4>
        </div>
        <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-end justify-center p-4">
          <div className="relative w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 300 100">
              <path
                d="M 0 80 Q 50 60 100 65 T 200 45 T 300 30"
                stroke="#f47c20"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="240" cy="38" r="4" fill="#f47c20" />
              <text x="230" y="30" className="text-xs" fill="#f47c20">$50000</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-semibold text-gray-900">Activity</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-gray-500">Calendar</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-500 rounded"></div>
            <span className="text-gray-500">Asset</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Items */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 sidebar-gradient rounded-full flex items-center justify-center">
            <span className="text-white text-xs">S</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Samuel</p>
            <p className="text-xs text-gray-500">Transfer USD, Today</p>
          </div>
          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Confirmed</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
