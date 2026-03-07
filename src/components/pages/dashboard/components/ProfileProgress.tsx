"use client";
import React, { useContext, useEffect, useState } from "react";
import AuthContext from "@/contexts/authContext/authContext";

type Greeting = {
  text: string;
  icon: string;
};

const getGreeting = (hour: number): Greeting => {
  if (hour >= 5 && hour < 12) return { text: "Good Morning", icon: "🌤️" };
  if (hour >= 12 && hour < 17) return { text: "Good Afternoon", icon: "☀️" };
  if (hour >= 17 && hour < 21) return { text: "Good Evening", icon: "🌇" };
  return { text: "Good Night", icon: "🌙" };
};

const ProfileProgress: React.FC = () => {
  const { user } = useContext(AuthContext);
  const completion = (() => {
    if (!user) {
      return 0;
    }

    const fields = [
      user.full_name,
      user.email,
      user.profile_picture,
      user.company_details?.company_name,
      user.company_details?.email,
      user.company_details?.phone,
      user.company_details?.address,
    ];
    const filled = fields.filter((value) =>
      Boolean(value && String(value).trim()),
    ).length;
    return Math.min(100, Math.round((filled / fields.length) * 100));
  })();
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (circumference * completion) / 100;
  const displayName = user?.full_name?.split(" ")[0] || "Jason";

  const [greeting, setGreeting] = useState<Greeting>(() =>
    getGreeting(new Date().getHours()),
  );

  useEffect(() => {
    const update = () => setGreeting(getGreeting(new Date().getHours()));
    update();
    const id = setInterval(update, 60_000); // refresh every minute
    return () => clearInterval(id);
  }, []);

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
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute top-[10%] right-[-2%] bg-[#f5752b] text-white text-[8px] font-bold px-1.5 py-0.25 rounded-full shadow-lg border-2 border-white z-20">
          {completion}%
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
                src={`https://api.dicebear.com/9.x/dylan/svg?seed=${`Bid` + (user?.full_name || "Jason")}`}
                alt="User Avatar"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-3">
        <h3 className="text-lg font-bold text-slate-900 flex items-center justify-center gap-1.5 tracking-tight">
          {greeting.text} {displayName} <span aria-hidden>{greeting.icon}</span>
        </h3>
        <p className="text-slate-400 text-[10px] font-medium leading-tight">
          Continue your work to achieve your target!
        </p>
      </div>
    </div>
  );
};

export default ProfileProgress;
