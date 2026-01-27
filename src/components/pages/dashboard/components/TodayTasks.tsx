"use client";
import React from "react";
import DetectionVelocityCard from "./today-tasks/DetectionVelocityCard";
import HeroHeader from "./today-tasks/HeroHeader";
import InsightTilesGrid from "./today-tasks/InsightTilesGrid";
import LiveOpsPanel from "./today-tasks/LiveOpsPanel";
import OpsTimelineCard from "./today-tasks/OpsTimelineCard";
import PipelineMonitorCard from "./today-tasks/PipelineMonitorCard";
import QuickStatsGrid from "./today-tasks/QuickStatsGrid";
import SystemHealthCard from "./today-tasks/SystemHealthCard";
import {
    heroBadges,
    insightTiles,
    modeToggles,
    pipelineStages,
    priorityList,
    quickStats,
    sparkline,
    systemHealth,
    teamMembers,
    timeline,
    throughputDelta,
} from "./today-tasks/constants";
import { useReadableDate } from "./today-tasks/hooks";

import useDashboardStats from "@/hooks/useDashboardStats";
import {
    CircleArrowOutUpLeft,
    CircleArrowOutUpRight,
    GitCompareArrows,
    GitGraph,
    CircleCheck,
    FolderLock
} from "lucide-react";

const TodayTasks: React.FC = () => {
    const readableDate = useReadableDate();
    const { stats, isLoading } = useDashboardStats();

    const dynamicQuickStats = [
        {
            label: "Blueprints",
            value: stats?.stats?.totalBlueprints || "0",
            trend: "Total in library",
            progress: 100,
            accent: "from-emerald-400/90 to-emerald-600",
            Icon: CircleArrowOutUpRight,
        },
        {
            label: "Projects",
            value: stats?.stats?.totalProjects || "0",
            trend: `${stats?.stats?.activeProjects || 0} active currently`,
            progress: 100,
            accent: "from-indigo-400/90 to-indigo-600",
            Icon: GitGraph,
        },
        {
            label: "Automation coverage",
            value: `${stats?.stats?.automationCoverage || 86}%`,
            trend: "AI agents active",
            progress: stats?.stats?.automationCoverage || 86,
            accent: "from-amber-400/90 to-amber-600",
            Icon: GitCompareArrows,
        },
        {
            label: "Turnaround speed",
            value: stats?.stats?.turnaroundSpeed || "6.4h",
            trend: "Avg processing time",
            progress: 63,
            accent: "from-purple-400/90 to-purple-600",
            Icon: CircleArrowOutUpLeft,
        },
    ];

    const dynamicTimeline = [
        ...(stats?.recentProjects?.map((p: any) => ({
            label: `Project Created: ${p.title}`,
            value: `By ${p.created_by_details?.full_name || 'Admin'}`,
            time: new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            iconClass: "bg-emerald-50 text-emerald-600",
            Icon: FolderLock,
        })) || []),
        ...(stats?.recentBlueprints?.map((bp: any) => ({
            label: `Blueprint Uploaded: ${bp.name}`,
            value: `Type: ${bp.type}`,
            time: new Date(bp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            iconClass: "bg-indigo-50 text-indigo-600",
            Icon: CircleArrowOutUpRight,
        })) || [])
    ].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 3);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white/50 backdrop-blur-xl">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const dynamicInsightTiles = [
        {
            title: "QA latency",
            value: "2m 18s",
            delta: "-34%",
            caption: "vs rolling avg",
            tone: "from-rose-100/80 to-orange-100/70",
        },
        {
            title: "Team Members",
            value: stats?.stats?.totalUsers || "0",
            delta: "+1",
            caption: "currently in organization",
            tone: "from-sky-100/80 to-blue-100/70",
        },
        {
            title: "Sync health",
            value: "99.2%",
            delta: "+0.6%",
            caption: "uptime past 24h",
            tone: "from-emerald-100/80 to-lime-100/70",
        },
    ];

    return (
        <section className="lg:col-span-2 relative overflow-y-auto h-screen  border border-white/70 bg-gradient-to-br from-white/90 via-slate-50/80 to-blue-50/90 text-slate-900 shadow-[0_35px_120px_rgba(15,23,42,0.15)] backdrop-blur-2xl">
            <div className="absolute inset-0 opacity-90" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(14,165,233,0.12), transparent 55%), radial-gradient(circle at 80% 0%, rgba(248,113,113,0.15), transparent 45%), radial-gradient(circle at 50% 100%, rgba(59,130,246,0.08), transparent 60%)" }} />
            <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/60 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 top-20 h-52 w-52 rounded-[40%] bg-sky-200/40 blur-3xl" />
            <div className="relative z-10 space-y-10 p-8 lg:p-10">
                <HeroHeader readableDate={readableDate} />
                <QuickStatsGrid stats={dynamicQuickStats} />

                <div className=" gap-6  flex w-full">
                    <DetectionVelocityCard priorityList={priorityList} sparklineValues={sparkline} />
                    <OpsTimelineCard timeline={dynamicTimeline.length > 0 ? dynamicTimeline : timeline} />
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                    <LiveOpsPanel heroBadges={heroBadges} teamMembers={teamMembers} />
                    <SystemHealthCard
                        systemHealth={systemHealth}
                        throughputDelta={throughputDelta}
                        modeToggles={modeToggles}
                    />
                </div>

                <InsightTilesGrid insightTiles={dynamicInsightTiles} />
                <PipelineMonitorCard pipelineStages={pipelineStages} />
            </div>
        </section>
    );
};

export default TodayTasks;
