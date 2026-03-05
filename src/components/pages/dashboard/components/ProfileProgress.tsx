"use client";
import React, { useContext } from "react";
import AuthContext from "@/contexts/authContext/authContext";

const ProfileProgress: React.FC = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex flex-col items-center justify-center -my-8">
      <div className="relative w-28 h-28">
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
        <div className="absolute top-[10%] right-[-2%] bg-[#f5752b] text-white text-[8px] font-bold px-1.5 py-0.25 rounded-full shadow-lg border-2 border-white z-20">
          32%
        </div>
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
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || "Jason"}`}
                alt="User Avatar"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-3">
        <h3 className="text-lg font-bold text-slate-900 flex items-center justify-center gap-1.5 tracking-tight">
          Good Morning {user?.full_name?.split(" ")[0] || "Jason"} 🔥
        </h3>
        <p className="text-slate-400 text-[10px] font-medium leading-tight">
          Continue your work to achieve your target!
        </p>
      </div>
    </div>
  );
};

export default ProfileProgress;
