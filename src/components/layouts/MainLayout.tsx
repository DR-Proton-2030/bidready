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
    <div className="min-h-screen ">

      <Sidebar />
      <div
        className={`layout-transition ${isSidebarCollapsed ? "lg:ml-16 ml-0" : "lg:ml-64 ml-0"
          }`}
      >
        <Navbar />
        <main className="relative h-[calc(100vh-72px)] overflow-y-auto no-scrollbar shadow-inner ">
          <div className="absolute inset-0 opacity-90 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(14,165,233,0.12), transparent 55%), radial-gradient(circle at 80% 0%, rgba(248,113,113,0.15), transparent 45%), radial-gradient(circle at 50% 100%, rgba(59,130,246,0.08), transparent 60%)" }} />

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
