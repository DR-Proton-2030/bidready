/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post } from "../apiMethod";

const initialRoute = "blueprints";

export const createBlueprint = async (
  payload: object,
  token?: string
): Promise<any> => {
  try {
    if (!token) {
      throw new Error("Token not found");
    }
    const response = await post(
      `/${initialRoute}/create-blueprint`,
      payload,
      token
    );
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
    console.log("===blueprints token", token);
    const response = await get(
      `/${initialRoute}/get-all-blueprints`,
      filter,
      token
    );
    return response;
  } catch (error: any) {
    console.log("===error", error);
    throw new Error(error.response?.data?.message || "Blueprint fetch failed");
  }
};

export const getBlueprintDetails = async (
  blueprintId: string,
  token?: string
): Promise<any> => {
  try {
    const response = await get(
      `/${initialRoute}/get-blueprint-details/${blueprintId}`,
      {},
      token
    );
    if (response) {
      return response.data;
    }
    throw new Error();
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Blueprint fetch failed");
  }
};
