import { User } from '@/@types/interface/user.interface';

export const USERS_DATA: User[] = [
  {
    id: 1,
    name: "Patrick Murphy",
    email: "patrick.murphy@buildready.com",
    role: "Admin",
    status: "Active",
    lastActive: "1 hour ago",
    avatar: "PM",
  },
  {
    id: 2,
    name: "Sarah Lee",
    email: "sarah.lee@buildready.com",
    role: "Project Manager",
    status: "Active",
    lastActive: "3 hours ago",
    avatar: "SL",
  },
  {
    id: 3,
    name: "David Miller",
    email: "david.miller@buildready.com",
    role: "Estimator",
    status: "Inactive",
    lastActive: "2 days ago",
    avatar: "DM",
  },
  {
    id: 4,
    name: "Emily Johnson",
    email: "emily.johnson@buildready.com",
    role: "Architect",
    status: "Active",
    lastActive: "6 hours ago",
    avatar: "EJ",
  },
  {
    id: 5,
    name: "Michael Chen",
    email: "michael.chen@buildready.com",
    role: "Engineer",
    status: "Active",
    lastActive: "30 mins ago",
    avatar: "MC",
  },
  {
    id: 6,
    name: "Rachel Adams",
    email: "rachel.adams@buildready.com",
    role: "Contractor",
    status: "Active",
    lastActive: "1 day ago",
    avatar: "RA",
  },
];

export const USER_ROLES = [
  "All",
  "Admin",
  "Project Manager",
  "Estimator",
  "Architect",
  "Engineer",
  "Contractor",
] as const;


export const USERS_TEXT = {
  pageTitle: "Users",
  addUserButton: "Add User",
  userTableHeaders: {
    user: "User",
    role: "Role",
    status: "Status",
    lastActive: "Last Active",
    actions: "Actions",
  },
} as const;
