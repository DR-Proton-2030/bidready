import { Project } from "@/@types/interface/project.interface";


export const PROJECTS_DATA: Project[] = [
  {
    id: 1,
    name: "BidReady Platform",
    description: "Main bidding platform development",
    status: "Active",
    lastUpdated: "2 hours ago",
    members: 5,
  },
  {
    id: 2,
    name: "Mobile App",
    description: "iOS and Android mobile application",
    status: "In Progress",
    lastUpdated: "1 day ago",
    members: 3,
  },
  {
    id: 3,
    name: "API Gateway",
    description: "Backend API development and integration",
    status: "Planning",
    lastUpdated: "3 days ago",
    members: 4,
  },
];

export const PROJECT_STATUSES = ["All", "Active", "In Progress", "Planning"] as const;

export const PROJECTS_TEXT = {
  pageTitle: "Projects",
  newProjectButton: "New Project",
} as const;
