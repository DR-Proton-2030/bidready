import React from "react";

export type SidebarIconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
  weight?: string;
};

export interface ISidebarItem {
  icon: React.ComponentType<SidebarIconProps>;
  iconProps?: SidebarIconProps;
  label: string;
  id: string;
  route: string;
  onClick?: () => void;
  adminOnly?: boolean;
}
