"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  PageHeader,
  BlueprintCard,
  BlueprintListItem,
} from "@/components/shared";
import {
  Magnifer,
  WidgetAdd,
  ListCheck,
  AddSquare,
  DocumentText,
} from "@solar-icons/react";
import Link from "next/link";
import { BluePrint } from "@/@types/interface/blueprint.interface";
import { BLUEPRINTS_TEXT } from "@/constants/blueprints/blueprints.constant";

const Blueprints: React.FC<{ data?: BluePrint[] }> = ({ data }) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [clientData, setClientData] = useState<BluePrint[] | null>(null);

  useEffect(() => {
    const shouldLoadFallback = !data || data.length === 0;
    if (!shouldLoadFallback) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("@token") : null;
    if (!token) return;

    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_BLUEPRINTS_API_URL ||
      "http://localhost:8989/api/v1";

    const loadBlueprints = async () => {
      try {
        const res = await fetch(
          `${base}/blueprints/get-all-blueprints?page=1`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );

        if (!res.ok) return;

        const json = await res.json().catch(() => null);
        if (json && Array.isArray(json.data)) {
          setClientData(json.data);
        }
      } catch (error) {
        console.error("Fallback blueprint fetch failed:", error);
      }
    };

    loadBlueprints();
  }, [data]);

  const resolvedData = useMemo(() => {
    if (clientData && clientData.length > 0) return clientData;
    return data || [];
  }, [clientData, data]);

  const filteredData = resolvedData.filter((blueprint) =>
    blueprint.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 px-5 sm:px-16 pt-10 h-screen bg-gradient-to-br from-slate-100 to-slate-200 min-h-[calc(100vh-64px)]">
      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between rounded-2xl border border-white/60 bg-white/70 p-2.5 shadow-sm backdrop-blur-xl">
        {/* Search */}
        <div className="flex w-full items-center gap-2 md:max-w-lg">
          <div className="relative flex-1">
            <Magnifer
              size={18}
              weight="Linear"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search blueprints by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200/60 bg-white/60 py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-orange-300/60 focus:ring-2 focus:ring-orange-200/30"
            />
          </div>
        </div>

        {/* View Toggle + New Blueprint */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-slate-200/60 bg-white/60 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg p-2 transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-white text-orange-500 shadow-sm ring-1 ring-black/5"
                  : "text-slate-400 hover:bg-white/50 hover:text-slate-600"
              }`}
              title="Grid View"
            >
              <WidgetAdd
                size={18}
                weight={viewMode === "grid" ? "Bold" : "Linear"}
              />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg p-2 transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-white text-orange-500 shadow-sm ring-1 ring-black/5"
                  : "text-slate-400 hover:bg-white/50 hover:text-slate-600"
              }`}
              title="List View"
            >
              <ListCheck
                size={18}
                weight={viewMode === "list" ? "Bold" : "Linear"}
              />
            </button>
          </div>
          <Link
            href="/create-blueprint"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-md"
          >
            <AddSquare size={18} weight="Bold" />
            <span className="hidden sm:inline">
              {BLUEPRINTS_TEXT.newBlueprintButton}
            </span>
          </Link>
        </div>
      </div>

      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
        }
      >
        {filteredData?.length === 0 && (
          <div className="text-center py-20 col-span-full bg-white/30 rounded-3xl border border-white/50 backdrop-blur-sm">
            <img
              src="https://img.icons8.com/?size=160&id=78339&format=png"
              alt="No blueprints found"
              className="mx-auto opacity-50 mb-4"
            />
            <p className="text-lg font-medium text-gray-500">
              No blueprints found matching &quot;{searchQuery}&quot;
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-primary hover:underline text-sm font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}
        {filteredData?.map((blueprint) =>
          viewMode === "grid" ? (
            <BlueprintCard key={blueprint._id} {...blueprint} />
          ) : (
            <BlueprintListItem key={blueprint._id} {...blueprint} />
          ),
        )}
      </div>
    </div>
  );
};

export default Blueprints;
