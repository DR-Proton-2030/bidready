"use client";

import React from "react";
import StatCard from "./dashboard/StatCard";
import AnalyticsChart from "./dashboard/AnalyticsChart";
import ReminderCard from "./dashboard/ReminderCard";

const Dasboard: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      {/* <div>
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Plan, prioritize, and accomplish your tasks with ease.</p>
      </div> */}

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Total Projects" value={24} delta="↑ 5 Increased from last month" gradient accentColorClass="orange" />
        <StatCard title="Ended Projects" value={10} delta="↑ 6 Increased from last month" />
        <StatCard title="Running Projects" value={12} delta="↑ 2 Increased from last month" />
      </div>

      {/* Bottom Section */}
      <div className="flex justify-between gap-6">
        {/* Project Analytics */}
        <div className="w-2/3 rounded-2xl p-6 shadow-sm bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Project Analytics</h2>
          <AnalyticsChart />
        </div>

        {/* Reminders */}
        <ReminderCard />
      </div>
    </div>
  );
};

export default Dasboard;
