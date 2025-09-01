/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/utils/api";
import { cookies } from "next/headers";

// Minimal response shape used by the UI. If you have a shared type, replace this import.
export interface IGetBlueprintsResponse {
  data: any[];
  pagination: { currentPage: number; pageCount: number };
  total: number;
}

export const getBlueprintData = async (
  page: number
): Promise<IGetBlueprintsResponse> => {
  try {
    const token = (await cookies()).get("token")?.value;
    const response = await api.project.getProjects({ page }, token);

    return response;
  } catch (error) {
    console.error("Blueprint API Error:", error);
    return { data: [], pagination: { currentPage: 1, pageCount: 1 }, total: 0 };
  }
};
