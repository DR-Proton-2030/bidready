import { LucideIcon } from "lucide-react";

export interface QuickStat {
  label: string;
  value: string;
  trend: string;
  progress: number;
  accent: string;
  Icon: LucideIcon;
}

export interface PriorityItem {
  title: string;
  subtitle: string;
  due: string;
  status: string;
  chip: string;
  chipClass: string;
  statusClass: string;
  Icon: LucideIcon;
}

export interface TimelineItem {
  label: string;
  value: string;
  time: string;
  iconClass: string;
  Icon: LucideIcon;
}

export interface HeroBadge {
  label: string;
  value: string;
  accent: string;
}

export interface TeamMember {
  initials: string;
  ring: string;
}

export interface PipelineStage {
  name: string;
  detail: string;
  metric: string;
  progress: number;
}

export interface ModeToggle {
  label: string;
  active: boolean;
}

export interface InsightTile {
  title: string;
  value: string;
  delta: string;
  caption: string;
  tone: string;
}
