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

const TodayTasks: React.FC = () => {
    const readableDate = useReadableDate();

    return (
        <section className="lg:col-span-2 relative overflow-y-auto h-screen  border border-white/70 bg-gradient-to-br from-white/90 via-slate-50/80 to-blue-50/90 text-slate-900 shadow-[0_35px_120px_rgba(15,23,42,0.15)] backdrop-blur-2xl">
            <div className="absolute inset-0 opacity-90" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(14,165,233,0.12), transparent 55%), radial-gradient(circle at 80% 0%, rgba(248,113,113,0.15), transparent 45%), radial-gradient(circle at 50% 100%, rgba(59,130,246,0.08), transparent 60%)" }} />
            <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/60 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 top-20 h-52 w-52 rounded-[40%] bg-sky-200/40 blur-3xl" />
            <div className="relative z-10 space-y-10 p-8 lg:p-10">
                <HeroHeader readableDate={readableDate} />
                <QuickStatsGrid stats={quickStats} />

                <div className=" gap-6  flex w-full">
                    <DetectionVelocityCard priorityList={priorityList} sparklineValues={sparkline} />
                    <OpsTimelineCard timeline={timeline} />
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                    <LiveOpsPanel heroBadges={heroBadges} teamMembers={teamMembers} />
                    <SystemHealthCard
                        systemHealth={systemHealth}
                        throughputDelta={throughputDelta}
                        modeToggles={modeToggles}
                    />
                </div>

                <InsightTilesGrid insightTiles={insightTiles} />
                <PipelineMonitorCard pipelineStages={pipelineStages} />
            </div>
        </section>
    );
};

export default TodayTasks;
