import {
  BarChart,
  CircleArrowOutUpLeft,
  CircleArrowOutUpRight,
  CircleCheck,
  CircleParkingOff,
  GitCompareArrows,
  GitGraph,
} from "lucide-react";
import {
  HeroBadge,
  InsightTile,
  ModeToggle,
  PipelineStage,
  PriorityItem,
  QuickStat,
  TeamMember,
  TimelineItem,
} from "./types";

export const quickStats: QuickStat[] = [
  {
    label: "Blueprints queued",
    value: "128",
    trend: "+18% vs last week",
    progress: 72,
    accent: "from-emerald-400/90 to-emerald-600",
    Icon: CircleArrowOutUpRight,
  },
  {
    label: "Revisions cleared",
    value: "34",
    trend: "5 pending approvals",
    progress: 44,
    accent: "from-indigo-400/90 to-indigo-600",
    Icon: GitGraph,
  },
  {
    label: "Automation coverage",
    value: "86%",
    trend: "12 flows optimized",
    progress: 86,
    accent: "from-amber-400/90 to-amber-600",
    Icon: GitCompareArrows,
  },
  {
    label: "Turnaround speed",
    value: "6.4h",
    trend: "median processing window",
    progress: 63,
    accent: "from-purple-400/90 to-purple-600",
    Icon: CircleArrowOutUpLeft,
  },
];

export const priorityList: PriorityItem[] = [
  {
    title: "Panel coordination walk-through",
    subtitle: "Permit set · Level 18",
    due: "09:45 AM",
    status: "In progress",
    chip: "Review",
    chipClass: "bg-amber-100 text-amber-700",
    statusClass: "text-amber-600",
    Icon: CircleArrowOutUpLeft,
  },
  {
    title: "Upload mechanical redlines",
    subtitle: "3 files waiting signature",
    due: "11:30 AM",
    status: "Waiting",
    chip: "Docs",
    chipClass: "bg-blue-100 text-blue-700",
    statusClass: "text-slate-500",
    Icon: CircleParkingOff,
  },
  {
    title: "AI variance report",
    subtitle: "Last run 23 mins ago",
    due: "02:10 PM",
    status: "Auto",
    chip: "Insights",
    chipClass: "bg-emerald-100 text-emerald-700",
    statusClass: "text-emerald-600",
    Icon: BarChart,
  },
];

export const timeline: TimelineItem[] = [
  {
    label: "Uploads validated",
    value: "+18 new documents",
    time: "08:12 AM",
    iconClass: "bg-emerald-50 text-emerald-600",
    Icon: CircleCheck,
  },
  {
    label: "Detections streaming",
    value: "Confidence avg 94%",
    time: "08:40 AM",
    iconClass: "bg-indigo-50 text-indigo-600",
    Icon: CircleArrowOutUpRight,
  },
  {
    label: "Schedule sync",
    value: "GC notes synced",
    time: "09:05 AM",
    iconClass: "bg-amber-50 text-amber-600",
    Icon: CircleArrowOutUpLeft,
  },
];

export const insightTiles: InsightTile[] = [
  {
    title: "QA latency",
    value: "2m 18s",
    delta: "-34%",
    caption: "vs rolling avg",
    tone: "from-rose-100/80 to-orange-100/70",
  },
  {
    title: "Active reviewers",
    value: "11",
    delta: "+3",
    caption: "currently online",
    tone: "from-sky-100/80 to-blue-100/70",
  },
  {
    title: "Sync health",
    value: "99.2%",
    delta: "+0.6%",
    caption: "uptime past 24h",
    tone: "from-emerald-100/80 to-lime-100/70",
  },
];

export const heroBadges: HeroBadge[] = [
  {
    label: "Syncs cleared",
    value: "117 ops",
    accent: "bg-emerald-100/70 text-emerald-700",
  },
  {
    label: "Exceptions",
    value: "3 flagged",
    accent: "bg-amber-100/70 text-amber-700",
  },
  {
    label: "Latency",
    value: "2m 12s",
    accent: "bg-sky-100/70 text-sky-700",
  },
  {
    label: "Docs streamed",
    value: "486",
    accent: "bg-fuchsia-100/70 text-fuchsia-700",
  },
];

export const teamMembers: TeamMember[] = [
  { initials: "MC", ring: "bg-slate-900 text-white" },
  { initials: "JL", ring: "bg-emerald-500 text-white" },
  { initials: "AR", ring: "bg-sky-500 text-white" },
  { initials: "+8", ring: "bg-white text-slate-700" },
];

export const pipelineStages: PipelineStage[] = [
  {
    name: "Ingest",
    detail: "Uploads + OCR",
    metric: "34 docs live",
    progress: 72,
  },
  {
    name: "Detect",
    detail: "AI sweeps",
    metric: "94% confidence",
    progress: 88,
  },
  {
    name: "Review",
    detail: "Human pass",
    metric: "11 reviewers",
    progress: 58,
  },
  {
    name: "Deliver",
    detail: "Pushed to GC",
    metric: "12 packets",
    progress: 41,
  },
];

export const modeToggles: ModeToggle[] = [
  { label: "Autonomous mode", active: true },
  { label: "Manual verify", active: false },
];

export const sparkline: number[] = [48, 62, 58, 71, 69, 78, 86];

export const systemHealth = 94;
export const throughputDelta = "+112 pph";
