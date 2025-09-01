export const DASHBOARD_STATS = [
  {
    id: 1,
    title: "Total Projects",
    value: "14",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
  },
  {
    id: 2,
    title: "Active Blueprints",
    value: "6",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-600",
  },
  {
    id: 3,
    title: "AI Takeoffs Completed",
    value: "7",
    color: "purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-600",
  },
  {
    id: 4,
    title: "Pending Access Requests",
    value: "2",
    color: "orange",
    bgColor: "bg-orange-100",
    textColor: "text-orange-600",
  },
];

export const RECENT_ACTIVITIES = [
  {
    id: 1,
    message: 'New project "Downtown Office Tower" created',
    time: "2 hours ago",
    borderColor: "border-blue-500",
  },
  {
    id: 2,
    message: 'Blueprint "floor_plan_level1.pdf" uploaded to "Sunrise Apartments"',
    time: "4 hours ago",
    borderColor: "border-green-500",
  },
  {
    id: 3,
    message: 'AI Takeoff completed for "Riverside Hospital" – 12,400 sq.ft detected',
    time: "6 hours ago",
    borderColor: "border-purple-500",
  },
  {
    id: 4,
    message: 'User "Emily Johnson" joined project "Greenfield Mall"',
    time: "8 hours ago",
    borderColor: "border-orange-500",
  },
  {
    id: 5,
    message: 'Project "Sunrise Apartments" status updated to In Progress',
    time: "1 day ago",
    borderColor: "border-blue-500",
  },
];


export const DASHBOARD_TEXT = {
  pageTitle: "Dashboard",
  recentActivityTitle: "Recent Activity",
} as const;
