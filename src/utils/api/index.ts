import {
  createUsers,
  getOtp,
  getProfile,
  getUsers,
  googleLogin,
  loginUser,
  logoutUser,
  signupUser,
  updateProfile,
  verifyToken,
} from "./auth/auth.api";
import { changePassword } from "./auth/forgetPassword";
import {
  createProject,
  getDashboardStats,
  getProjectDetails,
  getProjects,
} from "./project/project.api";
import {
  createBlueprint,
  getBlueprints,
  getBlueprintDetails,
} from "./blueprint/blueprint.api";

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
    getProfile,
    updateProfile,
  },
  project: {
    createProject,
    getProjects,
    getProjectDetails,
    getDashboardStats,
  },
  blueprint: {
    createBlueprint,
    getBlueprints,
    getBlueprintDetails,
  },
};
