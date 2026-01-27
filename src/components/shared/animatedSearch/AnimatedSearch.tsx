"use client";

import { Search, X, LayoutDashboard, FolderOpen, FileText, Shield, User, Settings, ArrowRight, CornerDownLeft, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { sidebarItems } from "@/constants/sidebar/sidebarItem.constant";
import { api } from "@/utils/api";

type SearchResult = {
  id: string;
  title: string;
  category: "Navigation" | "Projects" | "Blueprints" | "Settings";
  route: string;
  icon: React.ReactNode;
  description?: string;
};

export const AnimatedSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Static navigation items
  const navItems: SearchResult[] = useMemo(() => [
    ...sidebarItems.map(item => ({
      id: item.id,
      title: item.label,
      category: "Navigation" as const,
      route: item.route,
      icon: item.icon
    })),
    {
      id: "profile",
      title: "My Profile",
      category: "Settings" as const,
      route: "/profile",
      icon: <User className="w-5 h-5" />
    },
    {
      id: "settings",
      title: "Account Settings",
      category: "Settings" as const,
      route: "/settings",
      icon: <Settings className="w-5 h-5" />
    }
  ], []);

  // Fetch dynamic results
  useEffect(() => {
    if (!query.trim()) {
      setResults(navItems);
      return;
    }

    const fetchResults = async () => {
      try {
        const res = await api.search.globalSearch(query);
        const { projects, blueprints, users } = res || {};

        const projectResults: SearchResult[] = (projects || []).map((p: any) => ({
          id: p._id,
          title: p.title,
          category: "Projects",
          route: `/projects/${p._id}`,
          icon: <FolderOpen className="w-5 h-5 text-blue-500" />,
          description: p.description
        }));

        const blueprintResults: SearchResult[] = (blueprints || []).map((b: any) => ({
          id: b._id,
          title: b.name,
          category: "Blueprints",
          route: `/blueprints/${b._id}`,
          icon: <FileText className="w-5 h-5 text-purple-500" />,
          description: b.description
        }));

        const userResults: SearchResult[] = (users || []).map((u: any) => ({
          id: u._id,
          title: u.full_name,
          category: "Team" as any,
          route: `/access-management`,
          icon: <User className="w-5 h-5 text-white -500" />,
          description: u.email
        }));

        const filteredNav = navItems.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase())
        );

        const allResults = [
          ...filteredNav,
          ...projectResults,
          ...blueprintResults,
          ...userResults
        ];

        setResults(allResults);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Search fetch error:", error);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query, navItems]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }

      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleSelect = (result: SearchResult) => {
    router.push(result.route);
    setIsOpen(false);
    setQuery("");
  };

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    results.forEach(result => {
      if (!groups[result.category]) groups[result.category] = [];
      groups[result.category].push(result);
    });
    return groups;
  }, [results]);

  return (
    <>
      {/* Mobile search trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2.5 text-slate-600 hover:text-orange-500 hover:bg-blue-50 rounded-xl transition-all border border-slate-200"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Desktop Search trigger */}
      <div
        className="hidden md:flex flex-1 max-w-lg mx-8 cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <div className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl leading-5 bg-slate-50/50 backdrop-blur-sm text-slate-400 text-sm transition-all group-hover:bg-white group-hover:border-blue-200 group-hover:shadow-sm select-none">
            <div className="flex items-center justify-between">
              <span>Search projects, team, tools...</span>
              <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-white border border-slate-200 rounded-md shadow-sm flex items-center">
                  <span className="text-[12px]">⌘</span>
                </kbd>
                <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-white border border-slate-200 rounded-md shadow-sm">
                  K
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-start justify-center p-4 md:p-10 pt-20 md:pt-32"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />

            {/* Content */}
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -10, opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white/20 overflow-hidden flex flex-col max-h-[70vh]"
            >
              {/* Search Header */}
              <div className="relative flex items-center p-6 border-b border-slate-100">
                <Search className="absolute left-8 h-6 w-6 text-slate-400" />
                <input
                  autoFocus
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Where can I take you today?"
                  className="w-full pl-12 pr-12 text-xl font-medium bg-transparent placeholder-slate-400 focus:outline-none text-slate-900"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Results Area */}
              <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                {Object.keys(groupedResults).length > 0 ? (
                  Object.entries(groupedResults).map(([category, items]) => (
                    <div key={category} className="mb-6 last:mb-2">
                      <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                        {category}
                      </h3>
                      <div className="space-y-1">
                        {items.map((item) => {
                          const itemIndex = results.indexOf(item);
                          const isActive = selectedIndex === itemIndex;
                          return (
                            <button
                              key={item.id}
                              onMouseEnter={() => setSelectedIndex(itemIndex)}
                              onClick={() => handleSelect(item)}
                              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all text-left ${isActive
                                ? "bg-orange-500 text-white shadow-lg shadow-blue-200"
                                : "text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-xl border ${isActive ? "bg-white/20 border-white/10" : "bg-white border-slate-100 shadow-sm"
                                  }`}>
                                  {item.icon}
                                </div>
                                <div>
                                  <p className={`font-bold ${isActive ? "text-white" : "text-slate-900"}`}>
                                    {item.title}
                                  </p>
                                  {item.description && (
                                    <p className={`text-xs mt-0.5 line-clamp-1 ${isActive ? "text-blue-100" : "text-slate-500"}`}>
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className={`transition-all ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}>
                                <CornerDownLeft size={18} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="p-6 bg-slate-50 rounded-full mb-4">
                      <Search size={40} className="text-slate-300" />
                    </div>
                    <p className="text-slate-900 font-bold">No results found for &ldquo;{query}&rdquo;</p>
                    <p className="text-sm text-slate-500 mt-1">Try a different keyword or browse categories</p>
                  </div>
                )}
              </div>

              {/* Shortcut Footer */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm flex items-center">
                      <ArrowRight size={10} className="rotate-90" />
                    </kbd>
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm flex items-center">
                      <ArrowRight size={10} className="-rotate-90" />
                    </kbd>
                    <span>to navigate</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm flex items-center">
                      <CornerDownLeft size={10} />
                    </kbd>
                    <span>to select</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm">ESC</kbd>
                  <span>to close</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
