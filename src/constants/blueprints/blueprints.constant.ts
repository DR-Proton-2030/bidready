import { Blueprint } from '@/@types/interface/blueprint.interface';

export const BLUEPRINT_CATEGORIES = ["All", "Architectural", "MEP", "Mechanical", "Structural", "Civil"] as const;

export const BLUEPRINTS_DATA: Blueprint[] = [
  {
    id: 1,
    name: "Floor Plan - Level 1",
    description: "Detailed floor plan for ground level with room dimensions",
    category: "Architectural",
    lastModified: "2 hours ago",
    version: "v1.2",
  },
  {
    id: 2,
    name: "Electrical Layout",
    description: "Complete electrical wiring and lighting design",
    category: "MEP",
    lastModified: "1 day ago",
    version: "v2.0",
  },
  {
    id: 3,
    name: "Plumbing System",
    description: "Water supply and drainage system layout",
    category: "MEP",
    lastModified: "2 days ago",
    version: "v1.4",
  },
  {
    id: 4,
    name: "HVAC Design",
    description: "Heating, ventilation, and air conditioning duct design",
    category: "Mechanical",
    lastModified: "3 days ago",
    version: "v1.0",
  },
  {
    id: 5,
    name: "Structural Layout",
    description: "Columns, beams, and foundation details",
    category: "Structural",
    lastModified: "5 days ago",
    version: "v3.1",
  },
  {
    id: 6,
    name: "Site Plan",
    description: "Overall site plan showing building placement and landscaping",
    category: "Civil",
    lastModified: "1 week ago",
    version: "v1.3",
  },
];


export const BLUEPRINTS_TEXT = {
  pageTitle: "Blueprints",
  newBlueprintButton: "New Blueprint",
  allCategory: "All",
} as const;
