/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/utils/api";
import { cookies } from "next/headers";

export const getBlueprintDetailsData = async (
  blueprintId: string
): Promise<any> => {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      console.warn("No authentication token found for blueprint details");
      return null;
    }
    // const response = await api.blueprint.getBlueprintDetails(
    //   blueprintId,
    //   token
    // );
    // return response;
  } catch (error: any) {
    console.error("Blueprint Details API Error:", error);
    // Return null instead of throwing to prevent page crashes
    return null;
  }
};
