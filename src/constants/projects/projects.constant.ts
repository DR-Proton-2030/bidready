import { Project } from "@/@types/interface/project.interface";

export const PROJECTS_DATA: Project[] = [
  {
    id: 3,
    name: "Westfield Galleria Shopping & Entertainment Complex",
    description:
      "A large-scale retail destination featuring international brands, a multiplex, and dining spaces",
    status: "Planning",
    lastUpdated: "3 days ago",
    members: 8,
  },
  {
    id: 4,
    name: "St. Mary’s Advanced Multi-Specialty Medical Center",
    description:
      "A 600-bed hospital with specialized departments and state-of-the-art emergency care facilities",
    status: "Active",
    lastUpdated: "5 hours ago",
    members: 10,
  },
  {
    id: 5,
    name: "Harbor Point International Business & Technology Park",
    description:
      "A world-class technology and business hub with coworking offices, innovation labs, and data centers",
    status: "In Progress",
    lastUpdated: "12 hours ago",
    members: 7,
  },
  {
    id: 6,
    name: "Riverside Grand Convention & Cultural Center",
    description:
      "A modern convention facility with auditoriums, exhibition halls, and cultural event spaces",
    status: "Planning",
    lastUpdated: "4 days ago",
    members: 5,
  },
];

export const PROJECT_STATUSES = [
  "All",
  "Active",
  "In Progress",
  "Planning",
] as const;

export const PROJECTS_TEXT = {
  pageTitle: "Projects",
  newProjectButton: "New Project",
} as const;
