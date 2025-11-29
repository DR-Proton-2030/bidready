"use client";
import {
    BarChart,
    CircleArrowOutUpLeft,
    CircleArrowOutUpRight,
    CircleCheck,
    CircleParkingOff,
    GitCompareArrows,
    GitGraph,
} from "lucide-react";
import React, { useMemo } from "react";

const TodayTasks: React.FC = () => {
    const quickStats = [
        {
            label: "Blueprints queued",
            value: "128",
            trend: "+18% vs last week",
            progress: 72,
            accent: "from-emerald-400/90 to-emerald-600",
            Icon: CircleArrowOutUpRight,
        },
        {
            label: "Revisions cleared",
            value: "34",
            trend: "5 pending approvals",
            progress: 44,
            accent: "from-indigo-400/90 to-indigo-600",
            Icon: GitGraph,
        },
        {
            label: "Automation coverage",
            value: "86%",
            trend: "12 flows optimized",
            progress: 86,
            accent: "from-amber-400/90 to-amber-600",
            Icon: GitCompareArrows,
        },
        {
            label: "Turnaround speed",
            value: "6.4h",
            trend: "median processing window",
            progress: 63,
            accent: "from-purple-400/90 to-purple-600",
            Icon: CircleArrowOutUpLeft,
        },
    ];

    const priorityList = [
        {
            title: "Panel coordination walk-through",
            subtitle: "Permit set · Level 18",
            due: "09:45 AM",
            status: "In progress",
            chip: "Review",
            chipClass: "bg-amber-100 text-amber-700",
            statusClass: "text-amber-600",
            Icon: CircleArrowOutUpLeft,
        },
        {
            title: "Upload mechanical redlines",
            subtitle: "3 files waiting signature",
            due: "11:30 AM",
            status: "Waiting",
            chip: "Docs",
            chipClass: "bg-blue-100 text-blue-700",
            statusClass: "text-slate-500",
            Icon: CircleParkingOff,
        },
        {
            title: "AI variance report",
            subtitle: "Last run 23 mins ago",
            due: "02:10 PM",
            status: "Auto",
            chip: "Insights",
            chipClass: "bg-emerald-100 text-emerald-700",
            statusClass: "text-emerald-600",
            Icon: BarChart,
        },
    ];

    const timeline = [
        {
            label: "Uploads validated",
            value: "+18 new documents",
            time: "08:12 AM",
            iconClass: "bg-emerald-50 text-emerald-600",
            Icon: CircleCheck,
        },
        {
            label: "Detections streaming",
            value: "Confidence avg 94%",
            time: "08:40 AM",
            iconClass: "bg-indigo-50 text-indigo-600",
            Icon: CircleArrowOutUpRight,
        },
        {
            label: "Schedule sync",
            value: "GC notes synced",
            time: "09:05 AM",
            iconClass: "bg-amber-50 text-amber-600",
            Icon: CircleArrowOutUpLeft,
        },
    ];

    const sparkline = [48, 62, 58, 71, 69, 78, 86];

    const insightTiles = [
        {
            title: "QA latency",
            value: "2m 18s",
            delta: "-34%",
            caption: "vs rolling avg",
            tone: "from-rose-100/80 to-orange-100/70",
        },
        {
            title: "Active reviewers",
            value: "11",
            delta: "+3",
            caption: "currently online",
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

    const sparklinePoints = useMemo(() => {
        if (sparkline.length <= 1) return "";
        const width = 200;
        const height = 80;
        return sparkline
            .map((value, index) => {
                const x = (index / (sparkline.length - 1)) * width;
                const y = height - (value / 100) * height;
                return `${x},${y}`;
            })
            .join(" ");
    }, [sparkline]);

    const readableDate = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
    }).format(new Date());

    return (
        <section className="lg:col-span-2 relative overflow-hidden  border border-white/70 bg-gradient-to-br from-white/90 via-slate-50/80 to-blue-50/90 text-slate-900 shadow-[0_35px_120px_rgba(15,23,42,0.15)] backdrop-blur-2xl">
            <div className="absolute inset-0 opacity-90" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(14,165,233,0.12), transparent 55%), radial-gradient(circle at 80% 0%, rgba(248,113,113,0.15), transparent 45%), radial-gradient(circle at 50% 100%, rgba(59,130,246,0.08), transparent 60%)" }} />
            <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/60 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 top-20 h-52 w-52 rounded-[40%] bg-sky-200/40 blur-3xl" />
            <div className="relative z-10 space-y-10 p-8 lg:p-10">
                <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Today</p>
                        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Command Center</h2>
                        <p className="text-slate-500">{readableDate} • Operational view</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button className="rounded-2xl border border-white/60 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur hover:border-white hover:text-slate-900">Share Snapshot</button>
                        <button className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5">Create Task</button>
                    </div>
                </header>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {quickStats.map(({ label, value, trend, progress, accent, Icon }) => (
                        <article key={label} className="rounded-[30px] border border-white/60 bg-white/70 p-5 shadow-[0_25px_55px_rgba(15,23,42,0.12)] backdrop-blur">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${accent}`}>
                                    <Icon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
                                    <p className="text-3xl font-semibold text-slate-900">{value}</p>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-slate-500">{trend}</p>
                            <div className="mt-3 h-2 rounded-full bg-slate-100/80">
                                <div className="h-full rounded-full bg-gradient-to-r from-slate-900 to-slate-700" style={{ width: `${progress}%` }} />
                            </div>
                        </article>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <article className="rounded-[36px] border border-white/60 bg-white/70 p-6 shadow-[0_35px_65px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-slate-500">Detection velocity</p>
                                <h3 className="text-4xl font-semibold text-slate-900">+42%</h3>
                                <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">real-time boost</p>
                            </div>
                            <div className="rounded-2xl border border-white/70 bg-white/60 px-4 py-3 text-right backdrop-blur">
                                <p className="text-xs text-slate-500">Current shift</p>
                                <p className="text-lg font-semibold text-slate-900">High throughput</p>
                                <p className="text-sm text-emerald-500">98% confidence median</p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <svg viewBox="0 0 200 80" className="h-32 w-full text-emerald-500">
                                <polyline
                                    fill="url(#sparkGradient)"
                                    stroke="none"
                                    points={`0,80 ${sparklinePoints} 200,80`}
                                />
                                <polyline
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points={sparklinePoints}
                                />
                                <defs>
                                    <linearGradient id="sparkGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="rgba(16,185,129,0.35)" />
                                        <stop offset="100%" stopColor="rgba(15,23,42,0)" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            {priorityList.map(({ title, subtitle, due, status, chip, chipClass, statusClass, Icon }) => (
                                <div key={title} className="rounded-2xl border border-white/60 bg-white/60 p-4 backdrop-blur">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-white/70 p-2 shadow-sm backdrop-blur">
                                            <Icon className="h-4 w-4 text-slate-600" />
                                        </div>
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${chipClass}`}>{chip}</span>
                                    </div>
                                    <h4 className="mt-4 text-base font-semibold text-slate-900">{title}</h4>
                                    <p className="text-sm text-slate-500">{subtitle}</p>
                                    <div className="mt-4 flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Due {due}</span>
                                        <span className={`font-semibold ${statusClass}`}>{status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>

                    <article className="rounded-[36px] border border-white/60 bg-white/70 p-6 shadow-[0_35px_65px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Live activity</p>
                                <h3 className="text-2xl font-semibold text-slate-900">Ops timeline</h3>
                            </div>
                            <button className="text-sm font-semibold text-slate-600 hover:text-slate-900">View logs</button>
                        </div>
                        <div className="mt-6 space-y-5">
                            {timeline.map(({ label, value, time, iconClass, Icon }) => (
                                <div key={label} className="flex items-start gap-4">
                                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClass}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                                        <div className="flex items-center justify-between text-sm text-slate-500">
                                            <span>{time}</span>
                                            <span className="text-slate-400">System</span>
                                        </div>
                                        <p className="mt-1 font-semibold text-slate-900">{label}</p>
                                        <p className="text-sm text-slate-500">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {insightTiles.map(({ title, value, delta, caption, tone }) => (
                        <article key={title} className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/50 p-5 shadow-[0_25px_55px_rgba(15,23,42,0.1)] backdrop-blur">
                            <div className={`absolute inset-0 bg-gradient-to-br ${tone} opacity-80`} />
                            <div className="absolute inset-0 bg-white/60 mix-blend-screen" />
                            <div className="relative">
                                <p className="text-sm font-medium text-slate-600">{title}</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
                                <div className="mt-4 flex items-center gap-2 text-sm">
                                    <span className="rounded-full bg-white/70 px-3 py-0.5 font-semibold text-emerald-600 backdrop-blur">{delta}</span>
                                    <span className="text-slate-600">{caption}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TodayTasks;
