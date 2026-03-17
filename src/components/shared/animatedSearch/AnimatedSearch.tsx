"use client";

import {
  Magnifer,
  CloseCircle,
  Folder2,
  DocumentText,
  User,
  Settings,
  MenuDots,
  SquareArrowRight,
} from "@solar-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { sidebarItems } from "@/constants/sidebar/sidebarItem.constant";
import { api } from "@/utils/api";
import { Search } from "lucide-react";

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
  const navItems: SearchResult[] = useMemo(
    () => [
      ...sidebarItems.map((item) => {
        const Icon = item.icon;
        return {
          id: item.id,
          title: item.label,
          category: "Navigation" as const,
          route: item.route,
          icon: <Icon {...item.iconProps} size={18} weight="Linear" />,
        };
      }),
      {
        id: "profile",
        title: "My Profile",
        category: "Settings" as const,
        route: "/profile",
        icon: <User size={18} weight="Linear" />,
      },
      {
        id: "settings",
        title: "Account Settings",
        category: "Settings" as const,
        route: "/settings",
        icon: <Settings size={18} weight="Linear" />,
      },
    ],
    [],
  );

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

        const projectResults: SearchResult[] = (projects || []).map(
          (p: any) => ({
            id: p._id,
            title: p.title,
            category: "Projects" as const,
            route: `/project-details/${p._id}`,
            icon: (
              <Folder2 size={18} weight="Linear" className="text-blue-500" />
            ),
            description: p.description,
          }),
        );

        const blueprintResults: SearchResult[] = (blueprints || []).map(
          (b: any) => ({
            id: b._id,
            title: b.name,
            category: "Blueprints" as const,
            route: `/blueprints/${b._id}`,
            icon: (
              <DocumentText
                size={18}
                weight="Linear"
                className="text-purple-500"
              />
            ),
            description: b.description,
          }),
        );

        const userResults: SearchResult[] = (users || []).map((u: any) => ({
          id: u._id,
          title: u.full_name,
          category: "Navigation" as const,
          route: `/access-management`,
          icon: <User size={18} weight="Linear" className="text-slate-500" />,
          description: u.email,
        }));

        const filteredNav = navItems.filter((item) =>
          item.title.toLowerCase().includes(query.toLowerCase()),
        );

        setResults([
          ...filteredNav,
          ...projectResults,
          ...blueprintResults,
          ...userResults,
        ]);
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
        setIsOpen((prev) => !prev);
      }
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + results.length) % results.length,
        );
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
    results.forEach((r) => {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    });
    return groups;
  }, [results]);

  return (
    <>
      {/* Inline search trigger — sits inside the navbar */}
      <div
        className="flex w-full max-w-xl cursor-pointer items-center gap-3 rounded-full border border-slate-200/80 bg-white/60 px-4 py-4 backdrop-blur transition hover:bg-white/80 hover:shadow-sm"
        onClick={() => setIsOpen(true)}
      >
        <Search size={22} className="shrink-0 text-slate-400" />
        <span className="flex-1 hidden sm:inline  select-none text-sm text-slate-400">
          What would you like to find today?
        </span>
        <span className="flex-1  sm:hidden  select-none text-sm text-slate-400">
          Search..
        </span>

        <div className="hidden items-center gap-0.5 sm:flex">
          <kbd className="flex h-5 items-center rounded border border-slate-200 bg-white/80 px-1.5 text-[10px] font-semibold text-slate-400 shadow-m">
            ⌘
          </kbd>
          <span className="text-[10px] text-slate-300">+</span>
          <kbd className="flex h-5 items-center rounded border border-slate-200 bg-white/80 px-1.5 text-[10px] font-semibold text-slate-400 shadow-m">
            K
          </kbd>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-start justify-center px-4 pt-[12vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop — soft lavender tint like the image */}
            <div
              className="absolute inset-0 bg-indigo-200/40 backdrop-blur-xl"
              onClick={() => setIsOpen(false)}
            />

            {/* Container — glass panels stacked */}
            <motion.div
              initial={{ y: -16, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{
                y: -8,
                opacity: 0,
                scale: 0.97,
                transition: { duration: 0.12 },
              }}
              transition={{ type: "spring", damping: 28, stiffness: 380 }}
              className="relative flex w-full max-w-2xl flex-col gap-4"
            >
              {/* ─── Search bar panel ─── */}
              <div className="flex items-center gap-4 rounded-2xl border border-white/60 bg-white/80 px-5 py-4 shadow-[0_8px_32px_-8px_rgba(99,102,241,0.12)] backdrop-blur-2xl">
                <Magnifer
                  size={22}
                  weight="Bold"
                  className="shrink-0 text-slate-800"
                />
                <input
                  autoFocus
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What would you like to find today?"
                  className="min-w-0 flex-1 bg-transparent text-lg font-medium text-slate-800 outline-none placeholder:text-slate-400"
                />
                <div className="flex items-center gap-1.5">
                  <kbd className="flex h-6 items-center rounded-md border border-slate-200/80 bg-slate-100/80 px-1.5 text-[11px] font-bold text-slate-500">
                    ⌘
                  </kbd>
                  <span className="text-xs text-slate-300">+</span>
                  <kbd className="flex h-6 items-center rounded-md border border-slate-200/80 bg-slate-100/80 px-1.5 text-[11px] font-bold text-slate-500">
                    /
                  </kbd>
                </div>
              </div>

              {/* ─── Results panel ─── */}
              {results.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-[0_16px_48px_-12px_rgba(99,102,241,0.14)] backdrop-blur-2xl">
                  <div className="max-h-[50vh] overflow-y-auto">
                    {Object.entries(groupedResults).map(([category, items]) => (
                      <div key={category}>
                        {/* Category header */}
                        <div className="px-6 pb-1 pt-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                          {category}
                        </div>
                        {/* Items */}
                        <div className="divide-y divide-slate-100/80">
                          {items.map((item) => {
                            const globalIdx = results.indexOf(item);
                            const isActive = selectedIndex === globalIdx;
                            return (
                              <button
                                key={item.id + globalIdx}
                                onMouseEnter={() => setSelectedIndex(globalIdx)}
                                onClick={() => handleSelect(item)}
                                className={`flex w-full items-center gap-3 px-6 py-3.5 text-left transition-colors ${
                                  isActive ? "bg-slate-50/80" : ""
                                }`}
                              >
                                {/* Category icon */}
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-100/80 bg-white/90">
                                  {item.icon}
                                </span>
                                {/* Title + description */}
                                <div className="min-w-0 flex-1">
                                  <span
                                    className={`block text-[15px] font-medium ${
                                      isActive
                                        ? "text-slate-900"
                                        : "text-slate-700"
                                    }`}
                                  >
                                    {item.title}
                                  </span>
                                  {item.description && (
                                    <span className="block truncate text-xs text-slate-400">
                                      {item.description}
                                    </span>
                                  )}
                                </div>
                                {/* Right actions */}
                                <div className="flex shrink-0 items-center gap-2 text-slate-300">
                                  <MenuDots size={16} weight="Linear" />
                                  <SquareArrowRight size={16} weight="Linear" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {query.trim() && results.length === 0 && (
                <div className="flex flex-col items-center rounded-2xl border border-white/60 bg-white/80 px-6 py-12 text-center shadow-[0_16px_48px_-12px_rgba(99,102,241,0.14)] backdrop-blur-2xl">
                  <Magnifer
                    size={36}
                    weight="Linear"
                    className="mb-3 text-slate-300"
                  />
                  <p className="text-sm font-semibold text-slate-700">
                    No results found for &ldquo;{query}&rdquo;
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Try a different keyword or browse categories
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
