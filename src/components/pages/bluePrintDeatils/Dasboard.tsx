"use client";

import React from "react";
import StatCard from "./dashboard/StatCard";
import AnalyticsChart from "./dashboard/AnalyticsChart";
import ReminderCard from "./dashboard/ReminderCard";
import ImageCard from "./dashboard/ImageCard";
import DataGrid from "./dashboard/DataGrid";
import Piechart from "./dashboard/Piechart";

const Dasboard= ({blueprintDetails}:any) => {
  return (
    <div className="px-10 mx-auto space-y-6 pb-20">
      {/* Header */}
      {/* <div>
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Plan, prioritize, and accomplish your tasks with ease.</p>
      </div> */}

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <StatCard title="Total Floors" value={blueprintDetails?.total_images} delta="↑ 5 Increased from last month" gradient accentColorClass="orange" />
        <StatCard title="Total Area (sft)" value={blueprintDetails?.images_with_overlay_count} delta="↑ 6 Increased from last month" />
        <StatCard title="Lot Area (sft)" value={blueprintDetails?.total_images - blueprintDetails?.images_with_overlay_count} delta="↑ 2 Increased from last month" />
        <StatCard title="Percel Number" value={blueprintDetails?.total_images - blueprintDetails?.images_with_overlay_count} delta="↑ 2 Increased from last month" />

      </div>
      <div className="flex w-full gap-6">
      <DataGrid />
 <ImageCard blueprint_images={blueprintDetails?.blueprint_images ?? []} />
      </div>
      {/* Bottom Section */}
      <div className="flex justify-between gap-6">
        {/* Project Analytics */}
        <div className="w-3/5 rounded-2xl p-6 shadow-sm bg-gray-50">
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
