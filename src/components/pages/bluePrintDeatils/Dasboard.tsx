"use client";

import React from "react";
import { ArrowUpRight, Video } from "lucide-react";

const Dasboard: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">
            Plan, prioritize, and accomplish your tasks with ease.
          </p>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Total Projects */}
          <div className="bg-gradient-to-r from-[#e16349] to-[#ec8773] text-white rounded-2xl p-6 relative shadow-sm">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-medium">Total Projects</h2>
              <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full">
      <ArrowUpRight className="w-5 h-5 text-black" />
    </div>
            </div>
            <p className="text-5xl font-semibold mt-4">24</p>
            <p className="text-sm mt-3 bg-white/20 w-fit px-2 py-1 rounded-full">
              ↑ 5 Increased from last month
            </p>
          </div>

          {/* Ended Projects */}
          <div className=" rounded-2xl p-6 bg-gray-50 border border-gray-200">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-medium text-gray-900">
                Ended Projects
              </h2>
 {/* <div className="flex items-center justify-center w-10 h-10 bg-[#e16349] rounded-full">
      <ArrowUpRight className="w-5 h-5 text-white" />
    </div> */}
            </div>
            <p className="text-5xl font-semibold mt-4 text-gray-900">10</p>
            <p className="text-sm mt-3 text-orange-600  w-fit px-2 py-1 rounded-full">
              ↑ 6 Increased from last month
            </p>
          </div>

          {/* Running Projects */}
          <div className="rounded-2xl p-6 bg-gray-50 border border-gray-200">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-medium text-gray-900">
                Running Projects
              </h2>
              
            </div>
            <p className="text-5xl font-semibold mt-4 text-gray-900">12</p>
            <p className="text-sm mt-3 text-orange-600 w-fit px-2 py-1 rounded-full">
              ↑ 2 Increased from last month
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex justify-between gap-6">
          {/* Project Analytics */}
          <div className="w-2/3 rounded-2xl p-6 shadow-sm bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Project Analytics
            </h2>
            <div className="flex items-end justify-between h-48">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => {
                const heights = [50, 90, 70, 100, 60, 80, 60];
                const isActive = i === 2;
                return (
                  <div
                    key={day}
                    className="flex flex-col items-center justify-end w-12"
                  >
                    <div
                      className={`rounded-full w-12 ${
                        isActive
                          ? "bg-orange-400 [#e16349] text-green-900 relative"
                          : "bg-[#e16349]/20"
                      }`}
                      style={{ height: `${heights[i]*1.5}px` }}
                    >
                      {isActive && (
                        <span className="absolute -top-5 text-xs font-medium text-gray-600">
                          74%
                        </span>
                      )}
                    </div>
                    <span className="text-gray-400 mt-2 text-sm">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reminders */}
          <div className="bg-white w-1/3 rounded-2xl p-6 shadow-sm border flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3">
                Contributors
              </h2>
              <p className="text-green-700 text-xl font-semibold">
                Meeting with Arc Company
              </p>
              <p className="text-gray-500 mt-1 text-sm">
                Time : 02.00 pm - 04.00 pm
              </p>
            </div>
            <button className="mt-6 flex items-center justify-center bg-green-700 hover:bg-green-800 text-white rounded-full py-3 font-medium transition">
              <Video className="w-5 h-5 mr-2" /> Start Meeting
            </button>
          </div>
        </div>
      </div>
  );
};

export default Dasboard;
