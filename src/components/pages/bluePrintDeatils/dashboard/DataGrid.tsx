"use client";
import React from "react";
import { Search, Filter, Plus, MoreVertical, Download } from "lucide-react";



import { useState } from "react";

const ITEMS_PER_PAGE = 4;

const DataGrid = ({ data }: any) => {

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');

  // filtered across whole data set
  const filteredData = data.filter((item: any) => {
    if (!query) return true;
    const q = query.toString().toLowerCase();
    return (
      String(item.class || '').toLowerCase().includes(q) ||
      String(item.website || '').toLowerCase().includes(q) ||
      String(item.description || '').toLowerCase().includes(q) ||
      String(item.subdesc || '').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  // ensure current page is valid
  if (page > totalPages) setPage(1);
  const paginatedData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // CSV download handler
  const handleDownloadCSV = () => {
    // CSV header
    const header = ['Item Name', 'Quantity', 'Remarks'];
    // CSV rows (all data)
    const rows = data.map((item: any) => [
      item.class,
      Math.round(item.percentage),
      'AI Content Creation App: Makes magic with the power of AI/ML',
    ]);
    // Build CSV string
    const csvContent = [header, ...rows]
      .map(row => row.map(String).map((cell: string) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-50 rounded-2xl shadow-sm p-6 w-2/3">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Floor Activity History </h2>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center bg-white border border-gray-200 rounded-full px-4 shadow py-3 flex-grow">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search Order"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="bg-transparent outline-none text-md ml-2 w-full"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#e16349] text-white border px-5 py-3 rounded-full text-sm">
            <Filter size={16} /> Filter
          </button>
          <button
            className="flex items-center gap-2 px-5 py-3 bg-black/70 text-white -800 rounded-full text-sm font-medium hover:bg-gray-900 transition"
            onClick={handleDownloadCSV}
          >
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
          {paginatedData.map((classItem: any, idx: number) => (
            <div
              key={idx + (page - 1) * ITEMS_PER_PAGE}
              className="grid grid-cols-3 bg-white my-2 rounded-lg items-center py-4 hover:bg-gray-50 transition"
            >
              {/* Company Name */}
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold bg-gray-600 ml-4`}>
                  {classItem.class[0]}
                </div>
                <div>
                  <p className="font-medium">{classItem.class}</p>
                  <p className="text-gray-400 text-xs">{classItem?.class}</p>
                </div>
              </div>

              {/* Performance */}
              <div className="flex items-center gap-2">
                <div className="w-24 bg-[#e16349]/20 rounded-full h-2.5">
                  <div
                    className="bg-orange-400 h-2.5 rounded-full"
                    style={{ width: `${Math.round(classItem.percentage)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {Math.round(classItem.count)} Item
                </span>
              </div>

              {/* Description */}
              <div>
                <p className="font-medium">AI Content Creation App</p>
                <p className="text-gray-400 text-xs">Makes magic with the power of AI/ML</p>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            className="px-3 py-1 rounded-full bg-gray-200 text-gray-600 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="px-2 text-sm font-medium">Page {page} of {totalPages}</span>
          <button
            className="px-3 py-1 rounded-full bg-gray-200 text-gray-600 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataGrid;
