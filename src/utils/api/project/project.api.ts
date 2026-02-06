/* eslint-disable @typescript-eslint/no-explicit-any */
import { IProjectDetailsResponse } from "@/@types/api/project/project.interface";
import { get, post, patch, del } from "../apiMethod";

const initialRoute = "project";

export const createProject = async (
  payload: object,
  token?: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error("Token not found");
    }
    const response = await post(
      `/${initialRoute}/create-project`,
      payload,
      token
    );
    return response;
  } catch (error: any) {
    console.log("===>error", error);
    throw new Error(error.response?.data?.message || "Project creation failed");
  }
};

export const getProjects = async (
  filter: object = {},
  token?: string
): Promise<any> => {
  try {
    const response = await get(
      `/${initialRoute}/get-all-projects`,
      filter,
      token
    );
    return response;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Project fetch failed");
  }
};

export const getProjectDetails = async (
  projectId: string,
  token?: string
): Promise<IProjectDetailsResponse> => {
  try {
    const response = await get(
      `/${initialRoute}/get-project-details/${projectId}`,
      {},
      token
    );
    if (response) {
      return response.data;
    }
    throw new Error();
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Project fetch failed");
  }
};

export const getDashboardStats = async (token?: string): Promise<any> => {
  try {
    const response = await get(`/${initialRoute}/get-dashboard-stats`, {}, token);
    return response;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Dashboard stats fetch failed");
  }
};

export const updateProject = async (
  projectId: string,
  payload: object,
  token?: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error("Token not found");
    }
    const response = await patch(
      `/${initialRoute}/update-project/${projectId}`,
      payload,
      token
    );
    return response;
  } catch (error: any) {
    console.log("===>error", error);
    throw new Error(error.response?.data?.message || "Project update failed");
  }
};

export const deleteProject = async (
  projectId: string,
  token?: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error("Token not found");
    }
    const response = await del(
      `/${initialRoute}/delete-project/${projectId}`,
      token
    );
    return response;
  } catch (error: any) {
    console.log("===>error", error);
    throw new Error(error.response?.data?.message || "Project deletion failed");
  }
};

