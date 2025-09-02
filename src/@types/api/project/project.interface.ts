import { BluePrint } from "@/@types/interface/blueprint.interface";
import { Ipagination } from "../../interface/pagination.interface";
import { IProject } from "../../interface/project.interface";

export interface IGetProjectResponse{
    data: Array<IProject>;
    pagination : Ipagination;
    total: number;
}

export interface IProjectDetailsResponse extends IProject {
    blueprint_list: Array<BluePrint>;
}