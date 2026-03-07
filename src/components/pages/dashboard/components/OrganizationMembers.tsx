"use client";
import React, { useState } from "react";
import { Plus, ChevronDown, ChevronUp, Mail } from "lucide-react";
import { useUsers } from "@/hooks/useUsers/useUsers";

const COLLAPSED_COUNT = 2;

const getRoleBadge = (role?: string) => {
  const r = (role || "").toLowerCase().replace("_", " ");
  const map: Record<string, { bg: string; text: string }> = {
    admin: { bg: "bg-rose-50", text: "text-rose-600" },
    "company admin": { bg: "bg-rose-50", text: "text-rose-600" },
    "client admin": { bg: "bg-rose-50", text: "text-rose-600" },
    manager: { bg: "bg-amber-50", text: "text-amber-600" },
    "project admin": { bg: "bg-amber-50", text: "text-amber-600" },
    member: { bg: "bg-sky-50", text: "text-sky-600" },
    viewer: { bg: "bg-slate-50", text: "text-slate-500" },
  };
  const style = map[r] || { bg: "bg-slate-50", text: "text-slate-500" };
  return { label: r || "member", ...style };
};

const OrganizationMembers: React.FC = () => {
  const { filteredUsers: users, isLoading: usersLoading } = useUsers();
  const [expanded, setExpanded] = useState(false);

  const visibleUsers = expanded ? users : users.slice(0, COLLAPSED_COUNT);
  const hasMore = users.length > COLLAPSED_COUNT;

  return (
    <div className="flex flex-col gap-4 -mt-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-md font-bold text-slate-900">
            Organization Members
          </h2>
          {!usersLoading && (
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {users.length}
            </span>
          )}
        </div>

      </div>

      {/* Members List */}
      <div className="flex flex-col gap-1 min-h-[80px]">
        {usersLoading ? (
          <div className="flex flex-col gap-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-24 bg-slate-100 rounded" />
                    <div className="h-2 w-16 bg-slate-50 rounded" />
                  </div>
                </div>
                <div className="w-16 h-6 bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
              <Mail size={20} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">No members yet</p>
            <p className="text-xs text-slate-400 mt-1">Invite your team to get started</p>
          </div>
        ) : (
          visibleUsers.map((member: any, index: number) => {
            const badge = getRoleBadge(member.role);
            return (
              <div
                key={member._id || index}
                className="flex items-center justify-between group p-2 rounded-xl hover:bg-slate-50/80 transition-colors cursor-default"
                style={{
                  animation: expanded && index >= COLLAPSED_COUNT
                    ? `fadeSlideIn 200ms ease-out ${(index - COLLAPSED_COUNT) * 50}ms both`
                    : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
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
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col min-w-0">
                    <h4 className="font-semibold text-slate-800 text-[13px] leading-tight truncate max-w-[120px]">
                      {member.full_name}
                    </h4>
                    <p className="text-slate-400 text-[11px] font-medium truncate max-w-[120px]">
                      {member.email}
                    </p>
                  </div>
                </div>

                {/* Role badge */}
                {/* <span
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${badge.bg} ${badge.text}`}
                >
                  {badge.label}
                </span> */}
              </div>
            );
          })
        )}
      </div>

      {/* See All / Collapse toggle */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-3 bg-gradient-to-b from-indigo-50 to-indigo-100/80 text-slate-500 font-semibold text-xs rounded-2xl hover:from-slate-100 hover:to-slate-150 hover:text-slate-700 transition-all flex items-center justify-center gap-1.5 border border-slate-100"
        >
          {expanded ? (
            <>
              Show Less
              <ChevronUp size={14} />
            </>
          ) : (
            <>
              See All ({users.length - COLLAPSED_COUNT} more)
            </>
          )}
        </button>
      )}

      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default OrganizationMembers;
