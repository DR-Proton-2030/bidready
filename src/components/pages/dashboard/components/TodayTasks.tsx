"use client";
import React from "react";
import HeroHeader from "./today-tasks/HeroHeader";
import QuickStatsGrid from "./today-tasks/QuickStatsGrid";
import OpsTimelineCard from "./today-tasks/OpsTimelineCard";
import InsightTilesGrid from "./today-tasks/InsightTilesGrid";
import { DashboardCharts } from "./today-tasks/DashboardCharts";
import { useReadableDate } from "./today-tasks/hooks";
import useDashboardStats from "@/hooks/useDashboardStats";
import {
    CircleArrowOutUpRight,
    GitGraph,
    Users,
    Layers,
    FolderLock
} from "lucide-react";

const TodayTasks: React.FC = () => {
    const readableDate = useReadableDate();
    const { stats, isLoading } = useDashboardStats();

    const dynamicQuickStats = [
        {
            label: "Total Projects",
            value: stats?.stats?.totalProjects || "0",
            trend: "Projects in organization",
            progress: 100,
            accent: "from-indigo-400/90 to-indigo-600",
            Icon: GitGraph,
        },
        {
            label: "Active Projects",
            value: stats?.stats?.activeProjects || "0",
            trend: "Currently in progress",
            progress: 100,
            accent: "from-emerald-400/90 to-emerald-600",
            Icon: FolderLock,
        },
        {
            label: "Total Blueprints",
            value: stats?.stats?.totalBlueprints || "0",
            trend: "Uploads in library",
            progress: 100,
            accent: "from-amber-400/90 to-amber-600",
            Icon: CircleArrowOutUpRight,
        },
        {
            label: "Team Growth",
            value: stats?.stats?.totalUsers || "0",
            trend: "Active members",
            progress: 100,
            accent: "from-purple-400/90 to-purple-600",
            Icon: Users,
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
            Icon: Layers,
        })) || [])
    ].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white shadow-xl">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <p className="ml-4 text-slate-500 font-medium">Synchronizing organization data...</p>
            </div>
        );
    }

    const dynamicInsightTiles = [
        {
            title: "Total Blueprints",
            value: stats?.stats?.totalBlueprints || "0",
            delta: "",
            caption: "Files analyzed",
            tone: "from-emerald-100/80 to-lime-100/70",
        },
        {
            title: "Organization Team",
            value: stats?.stats?.totalUsers || "0",
            delta: "",
            caption: "Active members",
            tone: "from-sky-100/80 to-blue-100/70",
        },
        {
            title: "Project Throughput",
            value: stats?.stats?.totalProjects || "0",
            delta: "",
            caption: "Lifecycle active",
            tone: "from-rose-100/80 to-orange-100/70",
        },
    ];

    return (
        <section className="min-h-screen relative overflow-y-auto  border border-white/70 bg-gradient-to-br from-white/90 via-slate-50/80 to-blue-50/90 text-slate-900 shadow-[0_35px_120px_rgba(15,23,42,0.15)] backdrop-blur-2xl">
            <div className="absolute inset-0 opacity-90" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(14,165,233,0.12), transparent 55%), radial-gradient(circle at 80% 0%, rgba(248,113,113,0.15), transparent 45%), radial-gradient(circle at 50% 100%, rgba(59,130,246,0.08), transparent 60%)" }} />

            <div className="relative z-10 space-y-10 p-8 lg:p-12 max-w-7xl mx-auto">
                <HeroHeader readableDate={readableDate} />

                <div className="grid gap-8">
                    <QuickStatsGrid stats={dynamicQuickStats} />

                    <DashboardCharts
                        activityData={stats?.blueprintActivity || []}
                        distributionData={stats?.projectDistribution || []}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <OpsTimelineCard
                                timeline={dynamicTimeline.length > 0 ? dynamicTimeline : [
                                    {
                                        label: "System Ready",
                                        value: "No recent activity found",
                                        time: "Now",
                                        iconClass: "bg-slate-50 text-slate-400",
                                        Icon: GitGraph
                                    }
                                ]}
                            />
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2">Quick Insights</h3>
                            <InsightTilesGrid insightTiles={dynamicInsightTiles} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TodayTasks;
