"use client";

import React from "react";
import { 
  LayoutDashboard, 
  FolderOpen, 
  FileText, 
  Users, 
  Shield, 
  Settings,
  Clock,
  MessageSquare,
  ScrollText,
  User
} from "lucide-react";
import { ISidebarItem } from "@/@types/interface/sidebarItem.interface";

export const sidebarItems: ISidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    route: "/dashboard",
    icon: React.createElement(LayoutDashboard, { className: "w-6 h-6" }),
  },
  {
    id: "projects",
    label: "Projects",
    route: "/projects",
    icon: React.createElement(FolderOpen, { className: "w-6 h-6" }),
  },
  {
    id: "blueprints",
    label: "Blueprints",
    route: "/blueprints",
    icon: React.createElement(FileText, { className: "w-6 h-6" }),
  },
  {
    id: "reports",
    label: "Reports",
    route: "/reports",
    icon: React.createElement(ScrollText, { className: "w-6 h-6" }),
  },
  {
    id: "users",
    label: "Users",
    route: "/users",
    icon: React.createElement(Users, { className: "w-6 h-6" }),
  },
  {
    id: "feedback",
    label: "Feedback",
    route: "/feedback",
    icon: React.createElement(MessageSquare, { className: "w-6 h-6" }),
  },
  {
    id: "settings",
    label: "Settings",
    route: "/settings",
    icon: React.createElement(Settings, { className: "w-6 h-6" }),
  },
  {
    id: "access-management",
    label: "Access Management",
    route: "/access-management",
    icon: React.createElement(Shield, { className: "w-6 h-6" }),
  },
    {
    id: "logs",
    label: "Activity Logs",
    route: "/activity-logs",
    icon: React.createElement(Clock, { className: "w-6 h-6" }),
  },
];
