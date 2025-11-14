"use client";
import React, { useContext } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { sidebarItems } from "@/constants/sidebar/sidebarItem.constant";
import { useLayout } from "@/contexts/layoutContext/LayoutContext";
import AuthContext from "@/contexts/authContext/authContext";
import CompanyLogo from "@/components/shared/companyLogo/CompanyLogo";

const Sidebar = () => {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useLayout();
  const { user } = useContext(AuthContext);

  return (
    <>
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen bg-white/90 backdrop-blur-2xl 
          border-r border-gray-100/60 shadow-[4px_0_20px_-8px_rgba(0,0,0,0.1)]
          transition-all duration-300 ease-in-out
          flex flex-col
          ${isSidebarCollapsed ? "w-[72px]" : "w-64"}
        `}
      >
        {/* LOGO AREA */}
        <div
          className={`
            p-6 border-b border-gray-100 
            transition-all duration-300 
            ${isSidebarCollapsed ? "flex justify-center" : ""}
          `}
        >
          {user?.company_details?.logo ? (
            <Image
              src={user.company_details.logo}
              alt={user.company_details.company_name || "Company Logo"}
              width={isSidebarCollapsed ? 48 : 160}
              height={20}
              className="transition-all duration-300"
            />
          ) : (
            <CompanyLogo width={isSidebarCollapsed ? 40 : 150} />
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.route;

            return (
              <Link
                key={item.id}
                href={item.route}
                className={`
                  group flex items-center gap-3 rounded-2xl px-4 py-3 
                  transition-all duration-200
                  relative
                  ${isSidebarCollapsed ? "justify-center px-0" : ""}
                  ${isActive
                    ? "bg-orange-500/10 text-orange-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                  }
                `}
                title={isSidebarCollapsed ? item.label : ""}
              >
                {/* ICON */}
                <div
                  className={`
                    text-[20px] transition-all 
                    ${isActive ? "text-orange-600" : ""}
                  `}
                >
                  {item.icon}
                </div>

                {/* LABEL */}
                {!isSidebarCollapsed && (
                  <span
                    className={`
                      font-medium text-sm tracking-wide
                      ${isActive ? "text-orange-700" : "text-gray-600"}
                      group-hover:translate-x-1 transition
                    `}
                  >
                    {item.label}
                  </span>
                )}

                {/* Active Glow */}
                {isActive && (
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 w-[6px] h-[24px] bg-orange-500 rounded-full shadow-[0_0_12px_3px_rgba(255,125,0,0.5)]"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="mt-auto py-4 border-t border-gray-100 px-4">
          <div
            className={`
              flex flex-col items-center 
              ${isSidebarCollapsed ? "scale-90" : ""}
              transition-all duration-300
            `}
          >
            <p className="text-xs text-gray-400">Powered by</p>
            <div className="mt-2 w-24 opacity-80">
              <CompanyLogo />
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {!isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
