import { Blueprint } from '@/@types/interface/blueprint.interface';

export const BLUEPRINT_CATEGORIES = ["All", "Security", "Database", "Backend", "Frontend"] as const;

export const BLUEPRINTS_DATA: Blueprint[] = [
  {
    id: 1,
    name: "User Authentication",
    description: "Complete user authentication system blueprint",
    category: "Security",
    lastModified: "2 hours ago",
    version: "v2.1",
  },
  {
    id: 2,
    name: "Database Schema",
    description: "Database design and relationships blueprint",
    category: "Database",
    lastModified: "1 day ago",
    version: "v1.5",
  },
  {
    id: 3,
    name: "API Endpoints",
    description: "RESTful API endpoints and documentation",
    category: "Backend",
    lastModified: "3 days ago",
    version: "v3.0",
  },
  {
    id: 4,
    name: "UI Components",
    description: "Reusable UI components library",
    category: "Frontend",
    lastModified: "5 days ago",
    version: "v1.2",
  },
];

export const BLUEPRINTS_TEXT = {
  pageTitle: "Blueprints",
  newBlueprintButton: "New Blueprint",
  allCategory: "All",
} as const;
