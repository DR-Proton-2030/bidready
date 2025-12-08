"use client";

import React, { useMemo } from "react";
import StatCard from "./dashboard/StatCard";
import AnalyticsChart from "./dashboard/AnalyticsChart";
import ReminderCard from "./dashboard/ReminderCard";
import ImageCard from "./dashboard/ImageCard";
import DataGrid from "./dashboard/DataGrid";
import Piechart from "./dashboard/Piechart";
import HeroHeader from "../dashboard/components/today-tasks/HeroHeader";
import TopBar from "./TopBar";

const
  Dasboard = ({ blueprintDetails }: any) => {
    const readableDate = useMemo(() => new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), []);
    // quickStats removed implicit use; keep it here if you want to add QuickStatsGrid later
    return (
      <section className="lg:col-span-2  border border-white/70 relative overflow-y-auto h-[92vh]
      bg-gradient-to-br from-white/90 via-slate-50/80 to-blue-50/90 text-slate-900
       shadow-[0_35px_120px_rgba(15,23,42,0.15)] backdrop-blur-2xl">
        <div className="absolute inset-0 opacity-90" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(14,165,233,0.06), transparent 55%), radial-gradient(circle at 80% 0%, rgba(248,113,113,0.06), transparent 45%), radial-gradient(circle at 50% 100%, rgba(59,130,246,0.03), transparent 60%)" }} />
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 top-20 h-52 w-52 rounded-[40%] bg-sky-200/40 blur-3xl" />
        <div className="relative z-10 space-y-10 p-8 lg:p-10">
          <TopBar onToggleRightPanel={() => { }} blueprintDetails={blueprintDetails} />
          {/* <HeroHeader readableDate={readableDate} /> */}
          {/* Header */}
          {/* <div>
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Plan, prioritize, and accomplish your tasks with ease.</p>
      </div> */}

          {/* Top Cards / Quick stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <StatCard title="Total Floors" value={blueprintDetails?.total_images} delta="↑ 5 Increased from last month" gradient accentColorClass="from-orange-500 to-orange-400" />
            <StatCard title="Images with overlay" value={blueprintDetails?.images_with_overlay_count} delta="↑ 6 Increased from last month" gradient accentColorClass="from-indigo-400 to-indigo-600" />
            <StatCard title="Pending Overlays" value={(blueprintDetails?.total_images ?? 0) - (blueprintDetails?.images_with_overlay_count ?? 0)} delta="↓ 2 Pending" gradient accentColorClass="from-amber-400 to-amber-500" />
            <StatCard title="Total Classes" value={(blueprintDetails?.class_totals ?? []).length ?? 0} delta="+ 4 New" gradient accentColorClass="from-purple-400 to-purple-600" />

          </div>
          <div className="flex w-full gap-6">
            <DataGrid data={blueprintDetails?.class_totals ?? []} />
            <ImageCard blueprint_images={blueprintDetails?.blueprint_images ?? []} />
          </div>
          {/* Bottom Section */}

        </div>
      </section>
    );
  };

export default Dasboard;
