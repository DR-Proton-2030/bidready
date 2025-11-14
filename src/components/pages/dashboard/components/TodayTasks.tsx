"use client";
import { ArrowLeftToLine, BarChart, CircleArrowOutUpLeft, CircleArrowOutUpRight, CircleCheck, CircleParkingOff, GitCompareArrows, GitGraph } from "lucide-react";
import React from "react";

const TodayTasks: React.FC = () => {
    return (
        <div className="lg:col-span-2 rounded-3xl border-2 border-white/80 bg-white/50 backdrop-blur-xl p-8 shadow-[0_8px_35px_rgba(0,0,0,0.09)] hover:shadow-[0_12px_45px_rgba(0,0,0,0.12)] transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard</h2>
                <button className="text-sm text-gray-500 bg-white/40 px-4 py-1.5 rounded-full backdrop-blur-sm hover:bg-white/60 transition">
                    See All
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left large card (dark, orange theme) */}
                <div className="rounded-3xl p-6 bg-orange-400 text-white shadow-lg flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#4A5565]" >
                                <CircleArrowOutUpRight />
                            </div>
                        </div>

                        <button className="text-gray-300/80 hover:text-white/90">⋮</button>
                    </div>

                    <div className="mt-3">
                        <div className="text-lg text-white font-semibold">Total Balance</div>
                        <div className="text-3xl md:text-4xl font-extrabold mt-3">42</div>
                    </div>

                </div>

                {/* Middle card (orange accents) */}
                <div className="rounded-3xl p-6 bg-white shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center  bg-orange-400">
                                <CircleCheck className="text-white" />
                            </div>
                        </div>

                        <button className="text-gray-400">⋮</button>
                    </div>

                    <div className="mt-3">
                        <div className="text-lg text-gray-500 font-semibold">Total Spending</div>
                        <div className="text-2xl md:text-3xl font-bold mt-3" >20</div>
                    </div>
                </div>

                {/* Right card (orange accents) */}
                <div className="rounded-3xl p-6 bg-white shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center  bg-orange-400"  >
                                <BarChart className="text-white" />
                            </div>
                        </div>

                        <button className="text-gray-400">⋮</button>
                    </div>

                    <div className="mt-3">
                        <div className="text-lg text-gray-500 font-semibold">Total Saved</div>
                        <div className="text-2xl md:text-3xl font-bold mt-3" >12</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TodayTasks;
