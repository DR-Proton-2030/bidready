"use client";
import React from "react";
import Sidebar from "./sidebar/Sidebar";
import Navbar from "./navbar/Navbar";
import {
  LayoutProvider,
  useLayout,
} from "@/contexts/layoutContext/LayoutContext";

const MainLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { isSidebarCollapsed } = useLayout();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div
        className={`layout-transition ${isSidebarCollapsed ? "lg:ml-16 ml-0" : "lg:ml-64 ml-0"
          }`}
      >
        <Navbar />
        <main className="h-[calc(100vh-72px)] overflow-y-auto no-scrollbar shadow-inner bg-slate-50/50">
          <div className="p-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <LayoutProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </LayoutProvider>
  );
};

export default MainLayout;
