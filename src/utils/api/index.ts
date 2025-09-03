import {
  createUsers,
  getOtp,
  getUsers,
  googleLogin,
  loginUser,
  logoutUser,
  signupUser,
  verifyToken,
} from "./auth/auth.api";
import { changePassword } from "./auth/forgetPassword";
import {
  createProject,
  getProjectDetails,
  getProjects,
} from "./project/project.api";
import { createBlueprint, getBlueprints } from "./blueprint/blueprint.api";

export const api = {
  auth: {
    signupUser,
    loginUser,
    verifyToken,
    getOtp,
    googleLogin,
    createUsers,
    getUsers,
    logoutUser,
    changePassword,
  },
  project: {
    createProject,
    getProjects,
    getProjectDetails,
  },
  blueprint: {
    createBlueprint,
    getBlueprints,
  },
};
