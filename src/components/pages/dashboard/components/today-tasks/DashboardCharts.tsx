"use client";

import React from "react";
import TrendChart from "./TrendChart";
import ProjectStatusChart from "./ProjectStatusChart";

interface DashboardChartsProps {
    activityData: { day: string; count: number }[];
    distributionData: { label: string; value: number }[];
    recentProjects?: any[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
    activityData,
    distributionData,
    recentProjects = []
}) => {
    // Map the actual recent projects fetched in TodayTasks.tsx to the TrendChart format
    const trendProjects = recentProjects.slice(0, 3).map(p => ({
        label: p.title || p.name || "Untitled Project",
        value: 0 
    }));

    // Fallback labels if no projects are found
    if (trendProjects.length === 0) {
        trendProjects.push(
            { label: "No Projects Found", value: 0 },
            { label: "Start a New project", value: 0 },
            { label: "Upload Blueprints", value: 0 }
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
                <TrendChart 
                    title="New Request Trend" 
                    projects={trendProjects}
                />
            </div>
            <div>
                <ProjectStatusChart 
                    title="Project Status" 
                    distributionData={distributionData} 
                />
            </div>
        </div>
    );
};
