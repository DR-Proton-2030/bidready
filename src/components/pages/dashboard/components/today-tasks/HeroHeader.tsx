import React from "react";

interface HeroHeaderProps {
    readableDate: string;
}

const HeroHeader: React.FC<HeroHeaderProps> = ({ readableDate }) => (
    <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Today</p>
            <h2 className="mt-2 text-4xl font-semibold leading-tight text-slate-900 md:text-[2.75rem]">Command Center</h2>
            <p className="text-base text-slate-500">{readableDate} • Operational view</p>
        </div>
        <div className="flex flex-wrap gap-3">
            <button className="rounded-2xl border border-white/70 bg-white/70 px-5 py-2.5 text-sm font-medium text-slate-700 backdrop-blur transition hover:border-white hover:bg-white">
                Share Snapshot
            </button>
            <button className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5">
                Create Task
            </button>
        </div>
    </header>
);

export default HeroHeader;
