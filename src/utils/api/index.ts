import {
  createUsers,
  getOtp,
  getUsers,
  googleSignUp,
  loginUser,
  logoutUser,
  signupUser,
  verifyToken,
} from "./auth/auth.api";
import { createProject, getProjects } from "./project/project.api";

export const api = {
  auth: {
    signupUser,
    loginUser,
    verifyToken,
    getOtp,
    googleSignUp,
    createUsers,
    getUsers,
    logoutUser,
  },
  project: {
    createProject,
    getProjects
  },
};
