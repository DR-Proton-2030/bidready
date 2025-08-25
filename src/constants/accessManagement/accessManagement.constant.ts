import {
  Permission,
  AccessRequest,
  Role,
} from "@/@types/interface/accessManagement.interface";

export const PERMISSIONS_DATA: Permission[] = [
  {
    id: 1,
    name: "Project Management",
    description: "Create, edit, and delete construction projects",
    users: 10,
    lastUpdated: "2 hours ago",
  },
  {
    id: 2,
    name: "Blueprint Management",
    description: "Upload, view, and update architectural blueprints",
    users: 14,
    lastUpdated: "5 hours ago",
  },
  {
    id: 3,
    name: "Takeoff & Estimation",
    description: "Run AI takeoffs and generate cost estimates",
    users: 7,
    lastUpdated: "1 day ago",
  },
  {
    id: 4,
    name: "Collaboration Access",
    description: "Comment, tag, and assign tasks on blueprints",
    users: 12,
    lastUpdated: "2 days ago",
  },
  {
    id: 5,
    name: "User Administration",
    description: "Manage user accounts, roles, and permissions",
    users: 3,
    lastUpdated: "3 days ago",
  },
  {
    id: 6,
    name: "System Settings",
    description: "Configure platform-wide settings",
    users: 2,
    lastUpdated: "1 week ago",
  },
];

export const ACCESS_REQUESTS_DATA: AccessRequest[] = [
  {
    id: 1,
    user: "David Miller",
    permission: "Takeoff & Estimation",
    requestDate: "2 hours ago",
    status: "Pending",
  },
  {
    id: 2,
    user: "Rachel Adams",
    permission: "Blueprint Management",
    requestDate: "6 hours ago",
    status: "Approved",
  },
  {
    id: 3,
    user: "Emily Johnson",
    permission: "Project Management",
    requestDate: "1 day ago",
    status: "Pending",
  },
  {
    id: 4,
    user: "Michael Chen",
    permission: "Collaboration Access",
    requestDate: "2 days ago",
    status: "Approved",
  },
  {
    id: 5,
    user: "Sarah Lee",
    permission: "User Administration",
    requestDate: "3 days ago",
    status: "Denied",
  },
];

export const SYSTEM_ROLES: Role[] = [
  {
    name: "Admin",
    description: "Full system access, including user and settings management",
  },
  {
    name: "Project Manager",
    description: "Oversees projects, assigns tasks, and monitors progress",
  },
  {
    name: "Estimator",
    description:
      "Runs AI takeoffs, calculates quantities, and prepares cost estimates",
  },
  {
    name: "Architect",
    description: "Uploads and revises blueprints, ensures design accuracy",
  },
  {
    name: "Engineer",
    description: "Provides structural, mechanical, and technical design input",
  },
  {
    name: "Contractor",
    description:
      "Executes construction based on approved blueprints and estimates",
  },
  {
    name: "Viewer",
    description: "Read-only access to projects, blueprints, and reports",
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
