"use client";

import React, { useState } from "react";
import { PageHeader, BlueprintCard, BlueprintListItem } from "@/components/shared";
import { Search, LayoutGrid, List } from "lucide-react";
import { BluePrint } from "@/@types/interface/blueprint.interface";
import { BLUEPRINTS_TEXT } from "@/constants/blueprints/blueprints.constant";

const Blueprints: React.FC<{ data?: BluePrint[] }> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = data?.filter((blueprint) =>
    blueprint.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 px-16 pt-10 bg-gradient-to-br from-slate-100 to-slate-200 min-h-[calc(100vh-64px)]">
      <PageHeader
        title={BLUEPRINTS_TEXT.pageTitle}
        buttonText={BLUEPRINTS_TEXT.newBlueprintButton}
        link="/create-blueprint"
      />

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm bg-gray-100 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search blueprints by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/60 bg-white/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-gray-400 text-gray-700"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-white/60 p-1 rounded-xl border border-white/60">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'grid'
              ? 'bg-white shadow-sm text-primary ring-1 ring-black/5'
              : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
              }`}
            title="Grid View"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'list'
              ? 'bg-white shadow-sm text-primary ring-1 ring-black/5'
              : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
              }`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
        {
          filteredData?.length === 0 && (
            <div className="text-center py-20 col-span-full bg-white/30 rounded-3xl border border-white/50 backdrop-blur-sm">
              <img src="https://img.icons8.com/?size=160&id=78339&format=png" alt="No blueprints found" className="mx-auto opacity-50 mb-4" />
              <p className="text-lg font-medium text-gray-500">No blueprints found matching &quot;{searchQuery}&quot;</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-primary hover:underline text-sm font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )
        }
        {filteredData?.map((blueprint) => (
          viewMode === 'grid' ? (
            <BlueprintCard key={blueprint._id} {...blueprint} />
          ) : (
            <BlueprintListItem key={blueprint._id} {...blueprint} />
          )
        ))}
      </div>
    </div>
  );
};

export default Blueprints;
