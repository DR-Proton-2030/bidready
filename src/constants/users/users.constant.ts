import { User } from '@/@types/interface/user.interface';

export const USERS_DATA: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@bidready.com",
    role: "Admin",
    status: "Active",
    lastActive: "2 hours ago",
    avatar: "JD",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@bidready.com",
    role: "Project Manager",
    status: "Active",
    lastActive: "1 day ago",
    avatar: "JS",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@bidready.com",
    role: "Developer",
    status: "Inactive",
    lastActive: "3 days ago",
    avatar: "MJ",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.wilson@bidready.com",
    role: "Designer",
    status: "Active",
    lastActive: "5 hours ago",
    avatar: "SW",
  },
];

export const USER_ROLES = ["All", "Admin", "Project Manager", "Developer", "Designer"] as const;

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
