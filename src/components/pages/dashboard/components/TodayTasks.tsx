"use client";
import React from "react";

const TodayTasks: React.FC = () => {
    return (
        <div className="lg:col-span-2 rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-8 shadow-[0_8px_35px_rgba(0,0,0,0.09)] hover:shadow-[0_12px_45px_rgba(0,0,0,0.12)] transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Today Task</h2>
                <button className="text-sm text-gray-500 bg-white/40 px-4 py-1.5 rounded-full backdrop-blur-sm hover:bg-white/60 transition">
                    See All
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left large card (dark) */}
                <div className="rounded-3xl p-6 bg-slate-900 text-white shadow-lg flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#d9ff6b,#9cff4a)' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 1v22" stroke="#0b0b0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M17 6H7a3 3 0 100 6h10a3 3 0 110 6H7" stroke="#0b0b0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>

                        <button className="text-gray-300/80 hover:text-white/90">⋮</button>
                    </div>

                    <div className="mt-6">
                        <div className="text-sm text-gray-300">Total Project</div>
                        <div className="text-3xl md:text-4xl font-extrabold mt-3">65</div>
                    </div>

                </div>

                {/* Middle card */}
                <div className="rounded-3xl p-6 bg-white shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2v20" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M8 7h8" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>

                        <button className="text-gray-400">⋮</button>
                    </div>

                    <div className="mt-6">
                        <div className="text-sm text-gray-500">Total Spending</div>
                        <div className="text-2xl md:text-3xl font-bold mt-3">$ 3,450.65</div>
                    </div>
                </div>

                {/* Right card */}
                <div className="rounded-3xl p-6 bg-white shadow-sm flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 7h16v10H4z" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>

                        <button className="text-gray-400">⋮</button>
                    </div>

                    <div className="mt-6">
                        <div className="text-sm text-gray-500">Total Saved</div>
                        <div className="text-2xl md:text-3xl font-bold mt-3">$ 1,867.42</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TodayTasks;
