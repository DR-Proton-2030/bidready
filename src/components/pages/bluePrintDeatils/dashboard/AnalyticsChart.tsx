"use client";

import React from "react";
import { motion } from "framer-motion";

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
    <div className="mt-16 px-7">
      <div className="flex items-end justify-between h-56">
        {days.map((day, i) => {
          const isActive = i === activeIndex;
          const height = heights[i] ?? 100;

          return (
            <div key={day} className="flex flex-col items-center justify-end w-12">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: `${height * 2.4}px`, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
                className={`rounded-full w-12 ${
                  isActive ? "bg-orange-400 relative" : "bg-[#e16349]/20"
                }`}
              >
                {isActive && (
                  <span className="absolute -top-5 text-xs font-medium text-gray-600">
                    {activePercent}%
                  </span>
                )}
              </motion.div>

              <span className="text-gray-400 mt-2 text-sm">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsChart;
