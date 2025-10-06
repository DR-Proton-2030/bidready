"use client";

import React, { useEffect, useState } from "react";
import { Clock, CheckCircle, AlertCircle, BarChart3 } from "lucide-react";

interface QueueStats {
  totalJobs: number;
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
}

export default function QueueDashboard() {
  const [stats, setStats] = useState<QueueStats | null>(null);

  useEffect(() => {
    // This would call an API endpoint to get queue stats
    // For now, we'll use mock data
    const mockStats: QueueStats = {
      totalJobs: 15,
      pendingJobs: 2,
      processingJobs: 1,
      completedJobs: 11,
      failedJobs: 1,
    };

    setStats(mockStats);
  }, []);

  if (!stats) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Jobs",
      value: stats.totalJobs,
      icon: BarChart3,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Pending",
      value: stats.pendingJobs,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-50",
    },
    {
      title: "Processing",
      value: stats.processingJobs,
      icon: Clock,
      color: "text-purple-600 bg-purple-50",
    },
    {
      title: "Completed",
      value: stats.completedJobs,
      icon: CheckCircle,
      color: "text-green-600 bg-green-50",
    },
    {
      title: "Failed",
      value: stats.failedJobs,
      icon: AlertCircle,
      color: "text-red-600 bg-red-50",
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Processing Queue Status
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.title} className="text-center">
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${card.color} mb-2`}
            >
              <card.icon className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-sm text-gray-600">{card.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
