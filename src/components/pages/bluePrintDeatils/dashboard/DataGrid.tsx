"use client";
import React from "react";
import { Search, Filter, Plus, MoreVertical, Download } from "lucide-react";

const vendors = [
  {
    name: "Wall",
    website: "getblox.com",
    performance: 28,
    description: "AI Content Creation App",
    subdesc: "Makes magic with the power of AI/ML",
    date: "July 15, 2026",
    status: "Paid",
    color: "bg-green-100 text-green-700",
    icon: "bg-green-500",
  },
  {
    name: "Window",
    website: "brotha.gg",
    performance: 12,
    description: "AI Billing And Invoicing App",
    subdesc: "Makes invoice and billing with AIML",
    date: "July 8, 2026",
    status: "Failed",
    color: "bg-red-100 text-red-700",
    icon: "bg-pink-500",
  },
  {
    name: "Bed",
    website: "layerz.io",
    performance: 71,
    description: "Data Aggregation App",
    subdesc: "Compile and manage data seamlessly",
    date: "July 1, 2026",
    status: "Pending",
    color: "bg-yellow-100 text-yellow-700",
    icon: "bg-lime-500",
  },
  {
    name: "Bathroom",
    website: "linez.tech",
    performance: 20,
    description: "Social Media App",
    subdesc: "The world’s best social media app",
    date: "June 28, 2026",
    status: "Paid",
    color: "bg-green-100 text-green-700",
    icon: "bg-purple-400",
  },
  {
    name: "Planet X",
    website: "planetx.gg",
    performance: 30,
    description: "Rocket Management App",
    subdesc: "Manages your rocket easily",
    date: "June 11, 2026",
    status: "Paid",
    color: "bg-green-100 text-green-700",
    icon: "bg-blue-500",
  },
];

const DataGrid = () => {
  return (
    <div className="bg-gray-50 rounded-2xl shadow-sm p-6 w-2/3">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">
            Floor Activity History{" "}
          </h2>
        
        </div>
        
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center bg-white border border-gray-200 rounded-full px-4 shadow py-3 flex-grow">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search Order"
            className="bg-transparent outline-none text-md ml-2 w-full"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#e16349] text-white border px-5 py-3 rounded-full text-sm">
            <Filter size={16} /> Filter
          </button>
           <button className="flex items-center gap-2 px-5 py-3 bg-black/70 text-white -800 rounded-full 
           text-sm font-medium hover:bg-gray-900 transition">
               <Download className="w-4 h-4" /> Download csv
              </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
          <div className="grid grid-cols-3 text-gray-500 text-sm font-medium bg-gray-100 p-3 rounded-xl">
        <div>Item Name</div>
        <div>Quantity</div>
        <div>Remarks</div>
      </div>
      <div className="flex flex-col mt-2">
        {vendors.map((vendor, idx) => (
          <div
            key={idx}
            className="grid grid-cols-3 bg-white my-2 rounded-lg items-center py-4  hover:bg-gray-50 transition"
          >
            {/* Company Name */}
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold bg-gray-600 ml-4`}
              >
                {vendor.name[0]}
              </div>
              <div>
                <p className="font-medium">{vendor.name}</p>
                <p className="text-gray-400 text-xs">{vendor.website}</p>
              </div>
            </div>

            {/* Performance */}
            <div className="flex items-center gap-2">
              <div className="w-24 bg-[#e16349]/20 rounded-full h-2.5">
                <div
                  className="bg-orange-400 h-2.5 rounded-full"
                  style={{ width: `${vendor.performance}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">
                {vendor.performance}%
              </span>
            </div>

            {/* Description */}
            <div>
              <p className="font-medium">{vendor.description}</p>
              <p className="text-gray-400 text-xs">{vendor.subdesc}</p>
            </div>

         
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default DataGrid;
