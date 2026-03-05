"use client";

import { 
  Widget, 
  Folder2, 
  DocumentText, 
  ShieldUser 
} from "@solar-icons/react";
import { ISidebarItem } from "@/@types/interface/sidebarItem.interface";

const defaultIconProps = {
  size: 24,
  weight: "BoldDuotone",
} as const;

export const sidebarItems: any[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    route: "/dashboard",
    icon: Widget,
    iconProps: defaultIconProps,
  },
  {
    id: "projects",
    label: "Projects",
    route: "/projects",
    icon: Folder2,
    iconProps: defaultIconProps,
  },
  {
    id: "blueprints",
    label: "Blueprints",
    route: "/blueprints",
    icon: DocumentText,
    iconProps: defaultIconProps,
  },
  {
    id: "access-management",
    label: "Access Management",
    route: "/access-management",
    icon: ShieldUser,
    iconProps: defaultIconProps,
    adminOnly: true,
  },
];