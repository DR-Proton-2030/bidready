/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post } from "../apiMethod";
import { headers } from "@/config/config";

const initialRoute = "project";

export const createProject = async (
  payload: object,
  token?: string
): Promise<any> => {
  try {
    let authToken = token;
    if (!authToken && typeof window !== "undefined") {
      authToken = localStorage.getItem("@token") || undefined;
    }
    if (!authToken) {
      throw new Error("Token not found");
    }
    const response = await post(`/${initialRoute}/create-project`, payload, {
      ...headers,
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    });
    return response;
  } catch (error: any) {
    console.log("===>error", error);
    throw new Error(error.response?.data?.message || "Project creation failed");
  }
};

export const getProjects = async (filter: object = {}): Promise<any> => {
  try {
    const token = localStorage.getItem("@token");
    if (!token) {
      throw new Error("Token not found");
    }
    const { page = 1, limit = 10 } = filter as {
      page?: number;
      limit?: number;
    };
    const response = await get(
      `/${initialRoute}/get-projects`,
      { page, limit },
      token
    );
    return response;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Project fetch failed");
  }
};
