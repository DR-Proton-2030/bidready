"use client";

import React from "react";
import TodayTasks from "./components/TodayTasks";

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <TodayTasks />
    </div>
  );
};

export default Dashboard;
