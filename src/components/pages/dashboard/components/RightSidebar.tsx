"use client";
import React, { useContext } from "react";
import { MoreVertical, Plus, UserPlus } from "lucide-react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import AuthContext from "@/contexts/authContext/authContext";
import { useUsers } from "@/hooks/useUsers/useUsers";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Mentor {
    id: number;
    name: string;
    role: string;
    avatar: string;
}

const mentors: Mentor[] = [
    {
        id: 1,
        name: "Padhang Satrio",
        role: "Mentor",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Padhang",
    },
    {
        id: 2,
        name: "Zakir Horizontal",
        role: "Mentor",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zakir",
    },
    {
        id: 3,
        name: "Leonardo Samsul",
        role: "Mentor",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leonardo",
    },
];

const RightSidebar: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { filteredUsers: users, isLoading: usersLoading } = useUsers();

    const chartOptions: ApexOptions = {
        chart: {
            type: "bar",
            toolbar: { show: false },
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: "60%",
                distributed: true,
            },
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        grid: {
            show: true,
            borderColor: "#F1F5F9",
            strokeDashArray: 4,
            yaxis: { lines: { show: true } },
            xaxis: { lines: { show: false } },
            padding: { top: 0, right: 0, bottom: 0, left: 10 }
        },
        colors: ["#DDE2FF", "#6366F1", "#DDE2FF", "#6366F1", "#DDE2FF"],
        xaxis: {
            categories: ["1 Aug", "", "11 Aug", "", "21Aug"],
            labels: {
                style: { colors: "#94A3B8", fontSize: "11px", fontWeight: 500 },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            min: 0,
            max: 60,
            tickAmount: 3,
            labels: {
                style: { colors: "#94A3B8", fontSize: "11px", fontWeight: 500 },
            },
        },
    };

    const chartSeries = [
        {
            name: "Statistic",
            data: [35, 48, 35, 60, 32],
        },
    ];

    return (
        <aside className="w-full lg:w-80 bg-white/60 h-full  p-4 rounded-2xl m-5 flex flex-col gap-10">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Statistic</h2>
                <button className="text-slate-300 hover:text-slate-500 transition-colors">
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Profile Progress Section */}
            <div className="flex flex-col items-center justify-center -my-8">
                <div className="relative w-28 h-28">
                    {/* Outer Progress Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="56"
                            cy="56"
                            r="52"
                            stroke="#cecdcd8b"
                            strokeWidth="8"
                            fill="transparent"
                        />
                        <circle
                            cx="56"
                            cy="56"
                            r="52"
                            stroke="#f5752b"
                            strokeWidth="9"
                            fill="transparent"
                            strokeDasharray={326}
                            strokeDashoffset={326 - (326 * 32) / 100}
                            strokeLinecap="round"
                        />
                    </svg>
                    {/* Percentage Badge */}
                    <div className="absolute top-[10%] right-[-2%] bg-[#f5752b] text-white text-[8px] font-bold px-1.5 py-0.25 rounded-full shadow-lg border-2 border-white z-20">
                        32%
                    </div>
                    {/* Avatar Container */}
                    <div className="absolute inset-0 flex items-center justify-center p-3.5">
                        <div className="w-full h-full rounded-full bg-slate-50 overflow-hidden border-2 border-slate-50/50 shadow-inner">
                            {user?.profile_picture ? (
                                <img 
                                    src={user.profile_picture} 
                                    alt={user.full_name || "User Avatar"} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <img 
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'Jason'}`} 
                                    alt="User Avatar" 
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-center mt-3">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center justify-center gap-1.5 tracking-tight">
                        Good Morning {user?.full_name?.split(' ')[0] || 'Jason'} 🔥
                    </h3>
                    <p className="text-slate-400 text-[10px] font-medium leading-tight">
                        Continue your learning to achieve your target!
                    </p>
                </div>
            </div>

            {/* Bar Chart Section */}
            <div className="bg-[#F8FAFF] rounded-[32px] p-6">
                <div className="h-40 w-full">
                    <Chart
                        options={chartOptions}
                        series={chartSeries}
                        type="bar"
                        height="100%"
                    />
                </div>
            </div>

            {/* Mentors Section */}
            <div className="flex flex-col gap-6 -mt-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-md font-bold text-slate-900">Organization Members</h2>
                    <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-all">
                        <Plus size={16} />
                    </button>
                </div>

                <div className="flex flex-col gap-5 min-h-[100px]">
                    {usersLoading ? (
                        <div className="flex flex-col gap-4 animate-pulse">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-100" />
                                        <div className="space-y-2">
                                            <div className="h-3 w-24 bg-slate-100 rounded" />
                                            <div className="h-2 w-16 bg-slate-50 rounded" />
                                        </div>
                                    </div>
                                    <div className="w-20 h-8 bg-slate-100 rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        users.slice(0, 2).map((member: any) => (
                            <div key={member._id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-100">
                                            {member.profile_picture ? (
                                                <img 
                                                    src={member.profile_picture} 
                                                    alt={member.full_name} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <img 
                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.full_name}`} 
                                                    alt={member.full_name} 
                                                    className="w-full h-full object-contain" 
                                                />
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <div className="w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="font-bold text-slate-800 text-[14px] line-clamp-1">{member.full_name}</h4>
                                        <p className="text-slate-400 text-xs font-medium capitalize prose-sm">{member.role?.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                {/* <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-100 text-slate-500 font-bold text-[10px] hover:bg-slate-50 hover:border-slate-200 transition-all">
                                    <UserPlus size={12} className="text-[#6366F1]" strokeWidth={2.5} />
                                    Follow
                                </button> */}
                            </div>
                        ))
                    )}
                </div>

                <button className="w-full py-4 mt-2 bg-indigo-100/50 text-[#6366F1] font-bold text-sm rounded-[20px] hover:bg-indigo-200/50 transition-colors">
                    See All
                </button>
            </div>
        </aside>
    );
};

export default RightSidebar;
