export interface IProject{
    _id?: string
    title: string;
    description: string;
    scope: string;
    status: "active" | "completed" | "on-hold" | "in-progress";
    createdBy: string;
}
export interface ProjectStatus {
  name: string;
  value: string;
  colorClass: string;
}