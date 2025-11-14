"use client";
import React from "react";

const ProjectCompleted: React.FC = () => {
    const total = 100;
    const done = 50;
    const progress = 25;
    const backlog = 15;

    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const percentToDash = (val: number) => (val / total) * circumference;

    return (
        <div className="rounded-3xl border-2 border-white/80 bg-white/10 backdrop-blur-2xl p-8 shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_50px_rgba(0,0,0,0.18)] transition-all">
            {/* Header */}
            <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Project Completed</h3>
                <p className="text-sm text-gray-500">Total projects: 100</p>
            </div>

            <div className="flex items-center gap-10 mt-6">
                {/* Labels with gradient bullets */}
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                        <span className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 shadow-inner" />
                        <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wide">Project Done</p>
                            <p className="text-2xl font-bold text-gray-900">{done}%</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-inner" />
                        <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wide">In Progress</p>
                            <p className="text-xl font-semibold text-gray-900">{progress}%</p>
                        </div>
                    </div>


                </div>

                {/* Donut Chart */}
                <div className="w-48 h-48 relative">
                    <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
                        <circle
                            cx="20"
                            cy="20"
                            r={radius}
                            stroke="#f0f4f8"
                            strokeWidth="4"
                            fill="none"
                        />
                        <circle
                            cx="20"
                            cy="20"
                            r={radius}
                            stroke="#8b5cf6"
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${percentToDash(done)} ${circumference}`}
                        />
                        <circle
                            cx="20"
                            cy="20"
                            r={radius}
                            stroke="#fb923c"
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${percentToDash(progress)} ${circumference}`}
                            strokeDashoffset={-percentToDash(done)}
                        />
                        <circle
                            cx="20"
                            cy="20"
                            r={radius}
                            stroke="#60a5fa"
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${percentToDash(backlog)} ${circumference}`}
                            strokeDashoffset={-(percentToDash(done) + percentToDash(progress))}
                        />
                    </svg>

                    {/* Center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex flex-col items-center justify-center">
                            <p className="text-lg font-bold text-gray-900">{done + progress + backlog}%</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest -mt-1">Completed</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectCompleted;
