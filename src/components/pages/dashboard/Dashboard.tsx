"use client";

import React from "react";
import TodayTasks from "./components/TodayTasks";
import ProjectCompleted from "./components/ProjectCompleted";
import TrackerDetail from "./components/TrackerDetail";
import RankPerformance from "./components/RankPerformance";
import ChatCard from "./components/ChatCard";

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-10 px-10 pt-10 pb-16 bg-gradient-to-br from-slate-100 to-slate-200 min-h-[calc(100vh-64px)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <TodayTasks />
        <ProjectCompleted />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <RankPerformance />
        <TrackerDetail />
        <ChatCard />
      </div>
    </div>
  );
};

export default Dashboard;

