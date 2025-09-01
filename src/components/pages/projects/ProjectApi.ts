import { IGetProjectResponse } from "@/@types/api/project/project.interface";
import { api } from "@/utils/api";
import { cookies } from "next/headers";

export const getProjectData = async (page: number): Promise<IGetProjectResponse> => {
  try {
    const token = (await cookies()).get("token")?.value;
    const response = await api.project.getProjects({ page }, token);
    return response;
  } catch (error) {
    console.error("Project API Error:", error);
    return { data: [], pagination: { currentPage: 1, pageCount: 1 }, total: 0 };
  }
};
