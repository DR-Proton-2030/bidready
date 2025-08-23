import { Permission, AccessRequest, Role } from '@/@types/interface/accessManagement.interface';

export const PERMISSIONS_DATA: Permission[] = [
  {
    id: 1,
    name: "Project Management",
    description: "Create, edit, and delete projects",
    users: 12,
    lastUpdated: "2 hours ago",
  },
  {
    id: 2,
    name: "Blueprint Access",
    description: "View and modify system blueprints",
    users: 8,
    lastUpdated: "1 day ago",
  },
  {
    id: 3,
    name: "User Administration",
    description: "Manage user accounts and roles",
    users: 3,
    lastUpdated: "3 days ago",
  },
  {
    id: 4,
    name: "System Settings",
    description: "Configure system-wide settings",
    users: 2,
    lastUpdated: "1 week ago",
  },
];

export const ACCESS_REQUESTS_DATA: AccessRequest[] = [
  {
    id: 1,
    user: "Alice Brown",
    permission: "Blueprint Access",
    requestDate: "2 hours ago",
    status: "Pending",
  },
  {
    id: 2,
    user: "Bob Wilson",
    permission: "Project Management",
    requestDate: "1 day ago",
    status: "Approved",
  },
  {
    id: 3,
    user: "Carol Davis",
    permission: "User Administration",
    requestDate: "2 days ago",
    status: "Denied",
  },
];

export const SYSTEM_ROLES: Role[] = [
  {
    name: "Admin",
    description: "Full system access",
  },
  {
    name: "Project Manager",
    description: "Project oversight",
  },
  {
    name: "Developer",
    description: "Development access",
  },
  {
    name: "Viewer",
    description: "Read-only access",
  },
];

export const ACCESS_MANAGEMENT_TEXT = {
  pageTitle: "Access Management",
  createPermissionButton: "Create Permission",
  permissionsTitle: "Permissions",
  accessRequestsTitle: "Access Requests",
  roleBasedAccessTitle: "Role-based Access Control",
  approveButton: "Approve",
  denyButton: "Deny",
} as const;
