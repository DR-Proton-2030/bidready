/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGetBlueprintsResponse } from "@/@types/api/blueprint/blueprint.interface";
import { api } from "@/utils/api";
import { cookies } from "next/headers";

export const getBlueprintData = async (
  page: number
): Promise<IGetBlueprintsResponse> => {
  try {
    const token = (await cookies()).get("token")?.value;
    
    if (!token) {
      console.warn("No authentication token found for blueprints");
      return { 
        data: [], 
        pagination: { currentPage: 1, pageCount: 1 }, 
        total: 0 
      };
    }
    
    const response = await api.blueprint.getBlueprints({ page }, token);
    return response;
  } catch (error: any) {
    console.error("Blueprint API Error:", error);
    // Return empty data instead of throwing to prevent page crashes
    return { 
      data: [], 
      pagination: { currentPage: 1, pageCount: 1 }, 
      total: 0 
    };
  }
};
