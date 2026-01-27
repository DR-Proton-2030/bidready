import { get } from "../apiMethod";

const initialRoute = "search";

export const globalSearch = async (query: string): Promise<any> => {
  try {
    const token = localStorage.getItem("@token");
    const response = await get(`/${initialRoute}`, { query }, token || undefined);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Search failed");
  }
};
