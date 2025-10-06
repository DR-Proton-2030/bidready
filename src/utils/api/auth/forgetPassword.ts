import { Payload } from "../../../@types/api/api.types";
import { patch } from "../apiMethod";

const initialRoute = "auth";
export const changePassword = async (payload: Payload) => {
  try {
    const endpoint = `${initialRoute}/change-password`;
    const response = await patch(endpoint, payload);
    if (response) {
      const { result, token } = response;
      // if (message === MESSAGE.patch.succ) {
      //   return { result, token };
      // }
      return { result, token };
    }
    throw new Error();
  } catch (error) {
    console.log(error);
    throw error;
  }
};
