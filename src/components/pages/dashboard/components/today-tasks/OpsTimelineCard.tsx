import React from "react";
import { TimelineItem } from "./types";

interface OpsTimelineCardProps {
    timeline: TimelineItem[];
}

const OpsTimelineCard: React.FC<OpsTimelineCardProps> = ({ timeline }) => (
    <article className="rounded-[36px] w-full border border-white/60 bg-white/70 p-6 shadow-[0_35px_65px_rgba(15,23,42,0.12)] backdrop-blur-xl">
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
                        </div>
                        <p className="mt-1 font-semibold text-slate-900">{label}</p>
                        <p className="text-sm text-slate-500">{value}</p>
                    </div>
                </div>
            ))}
        </div>
    </article>
);

export default OpsTimelineCard;
