import { BluePrint } from "@/@types/interface/blueprint.interface";
import { Ipagination } from "@/@types/interface/pagination.interface";

export interface IGetBlueprintsResponse {
  data: BluePrint[];
  pagination: Ipagination;
  total: number;
}