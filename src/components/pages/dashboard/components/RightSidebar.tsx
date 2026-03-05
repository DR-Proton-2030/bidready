"use client";
import React from "react";
import { MoreVertical } from "lucide-react";
import ProfileProgress from "./ProfileProgress";
import StatisticsChart from "./StatisticsChart";
import OrganizationMembers from "./OrganizationMembers";

interface RightSidebarProps {
    monthlyActivity?: { month: string; count: number }[];
}

const RightSidebar: React.FC<RightSidebarProps> = ({ monthlyActivity = [] }) => {
    return (
        <aside className="w-full lg:w-80 bg-white/60 h-full p-4 rounded-2xl m-5 flex flex-col gap-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Statistic</h2>
                <button className="text-slate-300 hover:text-slate-500 transition-colors">
                    <MoreVertical size={20} />
                </button>
            </div>

            <ProfileProgress />
            <StatisticsChart monthlyActivity={monthlyActivity} />
            <OrganizationMembers />
        </aside>
    );
};

export default RightSidebar;
