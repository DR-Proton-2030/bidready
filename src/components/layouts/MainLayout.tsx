"use client";
import React from "react";
import Sidebar from "./sidebar/Sidebar";
import Navbar from "./navbar/Navbar";
import { LayoutProvider, useLayout } from "@/contexts/layoutContext/LayoutContext";

const MainLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { isSidebarCollapsed } = useLayout();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div 
        className={`layout-transition ${
          isSidebarCollapsed 
            ? 'lg:ml-16 ml-0' 
            : 'lg:ml-64 ml-0'
        }`}
      >
        <Navbar />
        <main className="pt-16 min-h-screen">
          <div className="p-4 lg:p-6">
            <div className="animate-fade-in">
              {children}
            </div>
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
