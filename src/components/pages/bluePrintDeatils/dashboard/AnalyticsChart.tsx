"use client";

import React from "react";

interface AnalyticsChartProps {
  days?: string[];
  heights?: number[];
  activeIndex?: number;
  activePercent?: number | string;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  days = ["S", "M", "T", "W", "T", "F", "S"],
  heights = [50, 90, 70, 100, 60, 80, 60],
  activeIndex = 2,
  activePercent = 74,
}) => {
  return (
    <div>
      <div className="flex items-end justify-between h-48">
        {days.map((day, i) => {
          const isActive = i === activeIndex;
          const height = heights[i] ?? 60;
          return (
            <div key={day} className="flex flex-col items-center justify-end w-12">
              <div
                className={`rounded-full w-12 ${isActive ? "bg-orange-400 relative" : "bg-[#e16349]/20"}`}
                style={{ height: `${height * 1.5}px` }}
              >
                {isActive && (
                  <span className="absolute -top-5 text-xs font-medium text-gray-600">{activePercent}%</span>
                )}
              </div>
              <span className="text-gray-400 mt-2 text-sm">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsChart;
