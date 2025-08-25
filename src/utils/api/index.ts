import {
  createUsers,
  getOtp,
  getUsers,
  googleSignUp,
  loginUser,
  signupUser,
  verifyToken,
} from "./auth/auth.api";

export const api = {
  auth: {
    signupUser,
    loginUser,
    verifyToken,
    getOtp,
    googleSignUp,
    createUsers,
    getUsers,
  },
};
