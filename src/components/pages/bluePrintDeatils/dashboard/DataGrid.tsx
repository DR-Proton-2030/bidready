"use client";
import React, { useState } from "react";
import { Search, Filter, Download, ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";

const ITEMS_PER_PAGE = 5;

// Color palette for item avatars
const AVATAR_COLORS = [
  "from-orange-400 to-orange-600",
  "from-indigo-400 to-indigo-600",
  "from-emerald-400 to-emerald-600",
  "from-rose-400 to-rose-600",
  "from-violet-400 to-violet-600",
  "from-cyan-400 to-cyan-600",
  "from-amber-400 to-amber-600",
  "from-fuchsia-400 to-fuchsia-600",
];

const DataGrid = ({ data }: any) => {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const filteredData = data.filter((item: any) => {
    if (!query) return true;
    const q = query.toString().toLowerCase();
    return (
      String(item.class || "").toLowerCase().includes(q) ||
      String(item.website || "").toLowerCase().includes(q) ||
      String(item.description || "").toLowerCase().includes(q) ||
      String(item.subdesc || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  if (page > totalPages) setPage(1);
  const paginatedData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleDownloadCSV = () => {
    const header = ["Item Name", "Quantity", "Percentage"];
    const rows = data.map((item: any) => [
      item.class,
      Math.round(item.count),
      `${Math.round(item.percentage)}%`,
    ]);
    const csvContent = [header, ...rows]
      .map((row) =>
        row
          .map(String)
          .map((cell: string) => `"${cell.replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "detection-data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 min-w-0 rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-100 px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 shadow-sm">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Detection Activity
              </h2>
              <p className="text-xs text-slate-400">
                {filteredData.length} item{filteredData.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>
          <button
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
            onClick={handleDownloadCSV}
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 transition-colors focus-within:border-orange-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search items..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-sm outline-none w-full text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_1fr_auto] gap-4 px-6 py-3 bg-slate-50/80 border-b border-slate-100">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Class Name
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Distribution
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 w-20 text-right">
          Count
        </span>
      </div>

      {/* Table body */}
      <div className="divide-y divide-slate-50">
        {paginatedData.length > 0 ? (
          paginatedData.map((classItem: any, idx: number) => {
            const colorIdx = (idx + (page - 1) * ITEMS_PER_PAGE) % AVATAR_COLORS.length;
            return (
              <div
                key={idx + (page - 1) * ITEMS_PER_PAGE}
                className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center px-6 py-3.5 transition-colors hover:bg-slate-50/80"
              >
                {/* Class name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} text-xs font-bold text-white shadow-sm`}
                  >
                    {classItem.class?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span className="text-sm font-medium text-slate-800 truncate">
                    {classItem.class}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${AVATAR_COLORS[colorIdx]} transition-all duration-500`}
                      style={{
                        width: `${Math.min(100, Math.round(classItem.percentage))}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-500 w-10 text-right tabular-nums">
                    {Math.round(classItem.percentage)}%
                  </span>
                </div>

                {/* Count */}
                <div className="w-20 text-right">
                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 tabular-nums">
                    {Math.round(classItem.count)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <Search className="w-8 h-8 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-500">No results found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search query
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
          <p className="text-xs text-slate-400">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(page * ITEMS_PER_PAGE, filteredData.length)} of{" "}
            {filteredData.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition ${p === page
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                {p}
              </button>
            ))}
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataGrid;
