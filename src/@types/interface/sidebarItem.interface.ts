import React from "react";

export interface ISidebarItem {
  icon: React.ReactNode;
  label: string;
  id: string;
  route: string;
  onClick?: () => void;
}
