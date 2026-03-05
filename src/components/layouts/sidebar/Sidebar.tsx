"use client";
import React, { useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { sidebarItems } from "@/constants/sidebar/sidebarItem.constant";
import { useLayout } from "@/contexts/layoutContext/LayoutContext";
import AuthContext from "@/contexts/authContext/authContext";
import CompanyLogo from "@/components/shared/companyLogo/CompanyLogo";

const Sidebar = () => {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useLayout();
  const { user } = useContext(AuthContext);

  // Check if user is admin (COMPANY_ADMIN role)
  const isAdmin = useMemo(() => {
    const role = user?.role?.toUpperCase() || "";
    return role === "COMPANY_ADMIN" || role === "ADMIN" || role === "SUPER_ADMIN";
  }, [user?.role]);

  // Filter sidebar items based on admin status
  const filteredSidebarItems = useMemo(() => {
    return sidebarItems.filter((item) => {
      // If item is admin-only, only show to admins
      if (item.adminOnly) {
        return isAdmin;
      }
      return true;
    });
  }, [isAdmin]);

  return (
    <>
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen bg-white shadow-lg
          border-r border-gray-100
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
            <img
              src={user.company_details.logo}
              alt={user.company_details.company_name || "Company Logo"}
              className={`object-contain transition-all duration-300 ${
                isSidebarCollapsed ? "h-12 w-12" : "h-8 w-40"
              }`}
              loading="lazy"
            />
          ) : (
            <CompanyLogo width={isSidebarCollapsed ? 40 : 150} />
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {filteredSidebarItems.map((item) => {
            const isActive = pathname === item.route;
            const Icon = item.icon;
            const itemClassName = [
              "group relative flex items-center gap-3 overflow-hidden rounded-2xl border transition-all duration-300",
              isSidebarCollapsed ? "justify-center px-0 py-3" : "px-4 py-3",
              isActive
                ? "bg-gradient-to-r from-orange-500 via-orange-500 to-orange-400 text-white border-orange-300/80 shadow-l"
                : "text-slate-600 border-transparent hover:bg-orange-50/70 hover:border-orange-100",
            ]
              .join(" ")
              .trim();

            const iconWrapperClassName = [
              "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300",
              isActive
                ? "bg-white/20 border-white/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_10px_18px_-12px_rgba(255,255,255,0.95)]"
                : "bg-white/80 border-slate-200/70 shadow-[0_10px_18px_-14px_rgba(15,23,42,0.45)] group-hover:bg-white group-hover:border-orange-200",
            ]
              .join(" ")
              .trim();

            const iconShineClassName = [
              "pointer-events-none absolute inset-[2px] rounded-full",
              isActive
                ? "bg-gradient-to-b from-white/55 via-white/20 to-transparent"
                : "bg-gradient-to-b from-white/90 via-white/45 to-transparent",
            ]
              .join(" ")
              .trim();

            const iconClassName = [
              "relative z-10 h-[18px] w-[18px] transition-all duration-300",
              isActive ? "text-white" : "text-slate-500 group-hover:text-orange-500",
              item.iconProps?.className ?? "",
            ]
              .join(" ")
              .trim();

            const labelClassName = [
              "font-semibold text-sm tracking-wide transition-all duration-300",
              isActive ? "text-white" : "text-slate-600 group-hover:text-orange-700",
            ]
              .join(" ")
              .trim();

            return (
              <Link
                key={item.id}
                href={item.route}
                className={itemClassName}
                title={isSidebarCollapsed ? item.label : ""}
              >
                {/* ICON */}
                <div className={iconWrapperClassName}>
                  {/* <span className={iconShineClassName}></span> */}
                  <Icon {...item.iconProps} className={iconClassName} />
                </div>

                {/* LABEL */}
                {!isSidebarCollapsed && (
                  <span className={labelClassName}>
                    {item.label}
                  </span>
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
