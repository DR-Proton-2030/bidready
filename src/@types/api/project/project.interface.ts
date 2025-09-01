import { Ipagination } from "../../interface/pagination.interface";
import { IProject } from "../../interface/project.interface";

export interface IGetProjectResponse{
    data: Array<IProject>;
    pagination : Ipagination;
    total: number;
}