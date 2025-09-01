/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post } from "../apiMethod";
import { headers } from "@/config/config";

const initialRoute = "blueprint";

export const createBlueprint = async (
  payload: object,
  token?: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error("Token not found");
    }
    const response = await post(`/${initialRoute}/create-blueprint`, payload, {
      ...headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });
    return response;
  } catch (error: any) {
    console.log("===>blueprint error", error);
    throw new Error(
      error.response?.data?.message || "Blueprint creation failed"
    );
  }
};

export const getBlueprints = async (
  filter: object = {},
  token?: string
): Promise<any> => {
  try {
    const response = await get(
      `/${initialRoute}/get-all-blueprints`,
      filter,
      token
    );
    return response;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Blueprint fetch failed");
  }
};
