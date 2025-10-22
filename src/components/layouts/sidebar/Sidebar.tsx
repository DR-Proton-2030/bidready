"use client";
import React, { useContext } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { sidebarItems } from "@/constants/sidebar/sidebarItem.constant";
import { useLayout } from "@/contexts/layoutContext/LayoutContext";
import CompanyLogo from "@/components/shared/companyLogo/CompanyLogo";
import AuthContext from "@/contexts/authContext/authContext";
import Image from "next/image";

const Sidebar = () => {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useLayout();
  const { user } = useContext(AuthContext);

  console.log("=== user ===>", user);

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-  h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarCollapsed
            ? "w-16 -translate-x-full lg:translate-x-0"
            : "w-64"
        }`}
      >
        <div className="h-full flex flex-col  custom-scrollbar overflow-y-auto">
          {/* Logo section */}
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-100">
            {user?.company_details?.logo ? (
              <Image
                src={user?.company_details?.logo}
                alt={`${user?.company_details?.company_name || "Company"} logo`}
                width={200}
                height={10}
              />
            ) : (
              <CompanyLogo width={150} />
            )}
          </div>

          {/* Navigation items */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.route;
              return (
                <Link
                  key={item.id}
                  href={item.route}
                  className={`sidebar-item group ${isActive ? "active" : ""} ${
                    isSidebarCollapsed ? "justify-center" : ""
                  }`}
                  title={isSidebarCollapsed ? item.label : ""}
                >
                  <div
                    className={`${
                      isActive ? "text-orange-700" : "text-gray-500"
                    }`}
                  >
                    {item.icon}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="font-medium text-sm animate-fade-in">
                      {item.label}
                    </span>
                  )}

                  {/* Tooltip for collapsed sidebar */}
                  {isSidebarCollapsed && (
                    <div className="tooltip group-hover:opacity-100">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="w-full bg-white px-4 py-3 border-t border-gray-100">
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-sm italic text-gray-500 font-normal">
                Powered by
              </p>
              <div className="mt-1 w-28">
                <CompanyLogo />
              </div>
            </div>
          </div>

   
        </div>
      </aside>

      {/* Mobile overlay */}
      {!isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 lg:hidden animate-fade-in"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
