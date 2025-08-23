import { ReactNode } from "react";

export interface ButtonProps {
  text: string;
  className?: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  data?: any; // Optional data for specific button actions
  fileName?: string; // Default file name for downloads
  downloadType?: string;
}
