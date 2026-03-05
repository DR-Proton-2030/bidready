"use client";
import React from "react";
import { Plus } from "lucide-react";
import { useUsers } from "@/hooks/useUsers/useUsers";

const OrganizationMembers: React.FC = () => {
  const { filteredUsers: users, isLoading: usersLoading } = useUsers();

  return (
    <div className="flex flex-col gap-6 -mt-3">
      <div className="flex items-center justify-between">
        <h2 className="text-md font-bold text-slate-900">
          Organization Members
        </h2>
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
            <div
              key={member._id}
              className="flex items-center justify-between group"
            >
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
                  <h4 className="font-bold text-slate-800 text-[14px] line-clamp-1">
                    {member.full_name}
                  </h4>
                  <p className="text-slate-400 text-xs font-medium capitalize prose-sm">
                    {member.role?.replace("_", " ")}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="w-full py-4 mt-2 bg-indigo-100/50 text-[#6366F1] font-bold text-sm rounded-[20px] hover:bg-indigo-200/50 transition-colors">
        See All
      </button>
    </div>
  );
};

export default OrganizationMembers;
