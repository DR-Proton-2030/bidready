"use client";
import React, { useContext, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  Settings,
  ChevronDown,
  User,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { useLayout } from "@/contexts/layoutContext/LayoutContext";
import AuthContext from "@/contexts/authContext/authContext";
import useAuthCredential from "@/hooks/authCredential/useAuthCredential";
import { AnimatedSearch } from "@/components/shared/animatedSearch/AnimatedSearch";

const Navbar = () => {
  const pathname = usePathname();
  const { toggleSidebar } = useLayout();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const { handleLogout } = useAuthCredential();

  // Get page title from pathname
  const getPageTitle = (path: string) => {
    if (!path) return "Dashboard";
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return "Dashboard";
    // Use only the first segment (e.g., 'blueprints' from '/blueprints/...')
    const first = decodeURIComponent(segments[0]).replace(/-/g, " ");
    return first.charAt(0).toUpperCase() + first.slice(1);
  };

  const notifications = [
    {
      id: 1,
      message: "New project 'Downtown Office Tower' created",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      message:
        "Blueprint 'floor_plan_level1.pdf' uploaded to 'Downtown Office Tower'",
      time: "3 hours ago",
      unread: true,
    },
    {
      id: 3,
      message: "User 'Sarah Lee' added to project 'Sunrise Apartments'",
      time: "5 hours ago",
      unread: true,
    },
    {
      id: 4,
      message: "Blueprint 'concept_design.pdf' updated in 'Greenfield Mall'",
      time: "1 day ago",
      unread: false,
    },
    {
      id: 5,
      message: "Project 'Riverside Hospital' status changed to Active",
      time: "2 days ago",
      unread: false,
    },
    {
      id: 6,
      message: "User 'David Miller' removed from 'Sunrise Apartments'",
      time: "3 days ago",
      unread: false,
    },
    {
      id: 7,
      message:
        "AI Takeoff completed for 'Downtown Office Tower' – 18,500 sq.ft detected",
      time: "3 days ago",
      unread: true,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 h-18 z-[100]">
      <div className="px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-200 transition-all border border-gray-200"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="hidden sm:block">
              {/* <h1 className="text-xl font-semibold text-gray-900">
                {getPageTitle(pathname)}
              </h1> */}
            </div>
          </div>

          {/* Search bar */}
          <AnimatedSearch />
          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Search icon for mobile */}
            <button className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="h-10 w-10 rounded-xl bg-gray-50 hover:bg-gray-200 flex items-center justify-center transition-all border border-gray-200  relative"
              >
                <Bell className="w-5 h-5 text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[110] animate-fade-in">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Notifications
                    </h3>
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 transition-colors cursor-pointer ${n.unread ? "bg-blue-50/60" : "hover:bg-gray-50"
                          }`}
                      >
                        <p className="text-sm text-gray-900">{n.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <button className="h-10 w-10 rounded-xl bg-gray-50 hover:bg-gray-200 flex items-center justify-center transition-all border border-gray-200  relative"
            >
              <Settings className="w-5 h-5 text-gray-700" />
            </button>


            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-200 transition-all border border-gray-200"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {user?.profile_picture ? (
                    <Image
                      src={user.profile_picture}
                      width={32}
                      height={32}
                      alt="avatar"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
                  )}
                </div>

                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.full_name}
                  </span>
                  <span className="text-xs text-gray-500 -mt-1">
                    {user?.company_details?.company_name}
                  </span>
                </div>

                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {/* User dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-gray-100 shadow-xl py-2 z-[110] animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.full_name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <a className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <HelpCircle className="w-4 h-4" />
                      Help
                    </a>
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(isUserMenuOpen || isNotificationOpen) && (
        <div
          className="fixed inset-0 z-[90]"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsNotificationOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;
