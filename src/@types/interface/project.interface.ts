import { IUser } from "./user.interface";

export interface IProject{
    _id?: string
    title: string;
    description: string;
    scope: string;
    status: "active" | "completed" | "on-hold" | "in-progress" | "planning";
    createdBy: string;
    created_by_details?: IUser;
    createdAt: Date;
    updatedAt: Date;
}
export interface ProjectStatus {
  name: string;
  value: string;
  colorClass: string;
}