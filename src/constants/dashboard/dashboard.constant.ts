export const DASHBOARD_STATS = [
  {
    id: 1,
    title: "Total Projects",
    value: "12",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
  },
  {
    id: 2,
    title: "Active Blueprints",
    value: "8",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-600",
  },
  {
    id: 3,
    title: "Total Users",
    value: "24",
    color: "purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-600",
  },
  {
    id: 4,
    title: "Access Requests",
    value: "3",
    color: "orange",
    bgColor: "bg-orange-100",
    textColor: "text-orange-600",
  },
];

export const RECENT_ACTIVITIES = [
  {
    id: 1,
    message: 'New project "BidReady Platform" created',
    time: "2 hours ago",
    borderColor: "border-blue-500",
  },
  {
    id: 2,
    message: 'Blueprint "User Authentication" updated',
    time: "4 hours ago",
    borderColor: "border-green-500",
  },
  {
    id: 3,
    message: 'New user "John Doe" added to system',
    time: "6 hours ago",
    borderColor: "border-purple-500",
  },
];

export const DASHBOARD_TEXT = {
  pageTitle: "Dashboard",
  recentActivityTitle: "Recent Activity",
} as const;
