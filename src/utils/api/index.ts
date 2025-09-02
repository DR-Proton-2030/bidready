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
import { changePassword } from "./auth/forgetPassword";
import { createProject, getProjects } from "./project/project.api";
import { createBlueprint, getBlueprints } from "./blueprint/blueprint.api";

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
    changePassword
  },
  project: {
    createProject,
    getProjects,
  },
  blueprint: {
    createBlueprint,
    getBlueprints,
  },
};
