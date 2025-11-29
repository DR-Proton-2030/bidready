import React from "react";
import { HeroBadge, TeamMember } from "./types";

interface LiveOpsPanelProps {
    heroBadges: HeroBadge[];
    teamMembers: TeamMember[];
}

const LiveOpsPanel: React.FC<LiveOpsPanelProps> = ({ heroBadges, teamMembers }) => (
    <article className="rounded-[36px] border border-white/60 bg-white/70 p-6 shadow-[0_35px_65px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
                <p className="text-sm text-slate-500">Live operating picture</p>
                <h3 className="text-3xl font-semibold text-slate-900">Blueprint systems nominal</h3>
                <p className="text-sm text-slate-500">Heartbeat refreshed 12 seconds ago</p>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50/70 px-4 py-1 text-sm font-semibold text-emerald-800">Auto-tuned</span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {heroBadges.map(({ label, value, accent }) => (
                <div key={label} className={`rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm ${accent}`}>
                    <p className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-500">{label}</p>
                    <p className="text-lg text-slate-900">{value}</p>
                </div>
            ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
                <p className="text-sm text-slate-500">Ops squad on deck</p>
                <p className="text-base font-semibold text-slate-900">Real-time co-pilot coverage</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                    {teamMembers.map(({ initials, ring }) => (
                        <span key={initials} className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/80 text-sm font-semibold ${ring}`}>
                            {initials}
                        </span>
                    ))}
                </div>
                <button className="rounded-2xl border border-white/60 bg-white/60 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur transition hover:border-white">
                    Ping squad
                </button>
            </div>
        </div>
    </article>
);

export default LiveOpsPanel;
