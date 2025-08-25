import { Project } from "@/@types/interface/project.interface";


export const PROJECTS_DATA: Project[] = [
  {
    id: 1,
    name: "Downtown Office Tower",
    description: "20-story commercial office building project",
    status: "Active",
    lastUpdated: "2 hours ago",
    members: 6
  },
  {
    id: 2,
    name: "Sunrise Apartments",
    description: "Residential apartment complex with 120 units",
    status: "In Progress",
    lastUpdated: "1 day ago",
    members: 4
  },
  {
    id: 3,
    name: "Greenfield Mall",
    description: "New retail shopping mall project",
    status: "Planning",
    lastUpdated: "3 days ago",
    members: 8
  },
  {
    id: 4,
    name: "Riverside Hospital",
    description: "Multi-specialty hospital with 500 beds",
    status: "Active",
    lastUpdated: "5 hours ago",
    members: 10
  },
];


export const PROJECT_STATUSES = ["All", "Active", "In Progress", "Planning"] as const;

export const PROJECTS_TEXT = {
  pageTitle: "Projects",
  newProjectButton: "New Project",
} as const;
