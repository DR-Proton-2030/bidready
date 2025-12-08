"use client";

import React from "react";
import { Plus } from "lucide-react";

const teamMembers = [
  {
    name: "Alexandra Deff",
    task: "Github Project Repository",
    status: "Completed",
    color: "bg-red-200",
    statusColor: "bg-green-100 text-green-700",
  },
  {
    name: "Edwin Adenike",
    task: "Integrate User Authentication System",
    status: "In Progress",
    color: "bg-green-200",
    statusColor: "bg-yellow-100 text-yellow-700",
  },
  {
    name: "Saac Oluwatemilorun",
    task: "Develop Search and Filter Functionality",
    status: "Pending",
    color: "bg-blue-200",
    statusColor: "bg-red-100 text-red-700",
  },

  {
    name: "Edwin Adenike",
    task: "Integrate User Authentication System",
    status: "In Progress",
    color: "bg-green-200",
    statusColor: "bg-yellow-100 text-yellow-700",
  },
  {
    name: "Saac Oluwatemilorun",
    task: "Develop Search and Filter Functionality",
    status: "Pending",
    color: "bg-blue-200",
    statusColor: "bg-red-100 text-red-700",
  },



];

const ReminderCard = () => {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.12)] backdrop-blur">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Team Collaboration</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-black/70 text-white -800 rounded-full text-sm font-medium hover:bg-green-50 transition">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {/* Member List */}
      <div className="space-y-4">
        {teamMembers.map((member, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 ${member.color} rounded-full flex items-center justify-center text-gray-700 font-bold`}
              >
                {member.name[0]}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  {member.name}
                </h3>
                <p className="text-xs text-gray-500">
                  Working on{" "}
                  <span className="text-gray-800 font-medium">
                    {member.task}
                  </span>
                </p>
              </div>
            </div>


          </div>
        ))}
      </div>
    </div>
  );
};

export default ReminderCard;
