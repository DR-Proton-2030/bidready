export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  lastUpdated: string;
  members: number;
}

export interface ProjectStatus {
  name: string;
  value: string;
  colorClass: string;
}
