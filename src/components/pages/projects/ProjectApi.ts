import { IGetProjectResponse } from "@/@types/api/project/project.interface";
import { api } from "@/utils/api";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const getProjectData = async (
  page: number
): Promise<IGetProjectResponse> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token)
      return {
        data: [],
        pagination: { currentPage: 1, pageCount: 1 },
        total: 0,
      };

    const response = await api.project.getProjects({ page }, token);
    console.log("======>resp", response);
    return response;
  } catch (error) {
    console.error("Project API Error:", error);
    return {
      data: [],
      pagination: { currentPage: 1, pageCount: 1 },
      total: 0,
    };
  }
};
