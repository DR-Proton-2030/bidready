"use client";
import React, { useContext, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HamburgerMenu,
  Letter,
  BellBing,
  User,
  Logout2,
  QuestionCircle,
} from "@solar-icons/react";
import { useLayout } from "@/contexts/layoutContext/LayoutContext";
import AuthContext from "@/contexts/authContext/authContext";
import useAuthCredential from "@/hooks/authCredential/useAuthCredential";
import { AnimatedSearch } from "@/components/shared/animatedSearch/AnimatedSearch";
import { Bell } from "@solar-icons/react/ssr";

const Navbar = () => {
  const { toggleSidebar } = useLayout();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const { handleLogout } = useAuthCredential();

  const notifications = [
    {
      id: 1,
      message: "New project 'Downtown Office Tower' created",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      message: "Blueprint 'floor_plan_level1.pdf' uploaded",
      time: "3 hours ago",
      unread: true,
    },
    {
      id: 3,
      message: "User 'Sarah Lee' added to project",
      time: "5 hours ago",
      unread: true,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <nav className="sticky top-0 z-[50] bg-white">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: hamburger (mobile) + search */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white/60 text-slate-600 backdrop-blur transition hover:bg-white lg:hidden"
            aria-label="Toggle sidebar"
          >
            <HamburgerMenu size={18} weight="Linear" />
          </button>

          <AnimatedSearch />
        </div>

        {/* Right side actions */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Mail */}
         

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/80 bg-gray-100 text-slate-600 backdrop-blur transition hover:bg-white"
              aria-label="Notifications"
            >
              <Bell size={18} weight="Linear" />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 z-[110] mt-2 w-80 overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-xl backdrop-blur-2xl">
                <div className="border-b border-slate-100 px-4 py-3">
                  <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`cursor-pointer px-4 py-3 transition ${
                        n.unread ? "bg-blue-50/40" : "hover:bg-slate-50"
                      }`}
                    >
                      <p className="text-sm text-slate-800">{n.message}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition hover:bg-white/60"
            >
              <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200/80 bg-white shadow-sm">
                {user?.profile_picture ? (
                  <Image
                    src={user.profile_picture}
                    width={36}
                    height={36}
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600" />
                )}
              </div>
              <span className="hidden max-w-[130px] truncate text-sm font-semibold text-slate-700 sm:block">
               Profile
              </span>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 z-[110] mt-2 w-52 rounded-2xl border border-white/60 bg-white/90 py-1.5 shadow-xl backdrop-blur-2xl">
                <div className="border-b border-slate-100 px-4 py-2.5">
                  <p className="text-sm font-semibold text-slate-800">{user?.full_name}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <User size={16} weight="Linear" />
                    Profile
                  </Link>
                  <a className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">
                    <QuestionCircle size={16} weight="Linear" />
                    Help
                  </a>
                </div>
                <div className="border-t border-slate-100 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    <Logout2 size={16} weight="Linear" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
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
