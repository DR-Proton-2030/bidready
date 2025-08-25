import { Payload } from "../../../@types/api/api.types";
import { headers } from "../../../config/config";
import { MESSAGE } from "../../../constants/api/message";
import { patch } from "../apiMethod";

const initialRoute = "auth";
export const changePassword = async (payload: Payload) => {
  try {
    const endpoint = `${initialRoute}/change-password`;
    const response = await patch(endpoint, payload); 
    if (response) {
      const { message, result, token } = response; 
      if (message === MESSAGE.patch.succ) {
        return { result, token };
      }
    }
    throw new Error();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

