"use client";

import React from "react";
import {
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal,
  Clock,
  Target,
  Users,
  Brain,
} from "lucide-react";
import StatCard from "@/components/shared/statCard/StatCard";
import ActivityItem from "@/components/shared/activityItem/ActivityItem";
import {
  DASHBOARD_STATS,
  RECENT_ACTIVITIES,
  DASHBOARD_TEXT,
} from "@/constants/dashboard/dashboard.constant";

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DASHBOARD_STATS.map((stat) => (
          <div
            key={stat.id}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                {stat.color === "blue" && (
                  <Target className={`w-6 h-6 ${stat.textColor}`} />
                )}
                {stat.color === "green" && (
                  <TrendingUp className={`w-6 h-6 ${stat.textColor}`} />
                )}
                {stat.color === "purple" && (
                  <Users className={`w-6 h-6 ${stat.textColor}`} />
                )}
                {stat.color === "orange" && (
                  <Clock className={`w-6 h-6 ${stat.textColor}`} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Uploaded Blueprints
            </h2>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
              See all
            </button>
          </div>

          <div className="space-y-4">
            {[
              {
                name: "Floor Plan - Level 1",
                file: "floor_plan_level1.pdf",
                version: "v1.2",
                lastModified: "2 hours ago",
                updated: true,
              },
              {
                name: "Electrical Layout",
                file: "electrical_layout.pdf",
                version: "v2.0",
                lastModified: "1 day ago",
                updated: true,
              },
              {
                name: "Plumbing System",
                file: "plumbing_system.pdf",
                version: "v1.4",
                lastModified: "3 days ago",
                updated: false,
              },
              {
                name: "HVAC Design",
                file: "hvac_design.dwg",
                version: "v1.0",
                lastModified: "5 hours ago",
                updated: true,
              },
              {
                name: "Fire Safety Layout",
                file: "fire_safety_layout.pdf",
                version: "v1.3",
                lastModified: "6 days ago",
                updated: false,
              },
              {
                name: "Structural Blueprint",
                file: "structural_blueprint.dxf",
                version: "v2.1",
                lastModified: "1 week ago",
                updated: false,
              },
            ].map((blueprint, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {blueprint.file.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {blueprint.name}
                    </p>
                    <p className="text-sm text-gray-500">{blueprint.file}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {blueprint.version}
                  </p>
                  <p
                    className={`text-sm ${
                      blueprint.updated ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {blueprint.lastModified}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {DASHBOARD_TEXT.recentActivityTitle}
            </h2>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
              See all
            </button>
          </div>
          <div className="space-y-4">
            {RECENT_ACTIVITIES.map((activity) => (
              <div
                key={activity.id}
                className={`border-l-3 ${activity.borderColor} pl-4`}
              >
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Blueprint Statistics
            </h2>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
              See all
            </button>
          </div>

          <div className="space-y-4">
            {[
              { category: "Floor Plans", count: 12, icon: "FP" },
              { category: "Electrical Layouts", count: 8, icon: "EL" },
              { category: "Plumbing Systems", count: 6, icon: "PL" },
              { category: "HVAC Designs", count: 4, icon: "HV" },
              { category: "Fire Safety Layouts", count: 3, icon: "FS" },
              { category: "Structural Blueprints", count: 7, icon: "ST" },
            ].map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {stat.icon}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900">{stat.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{stat.count}</p>
                  <p className="text-sm text-gray-500">files</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
