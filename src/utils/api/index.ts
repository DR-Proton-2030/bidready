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
  updateUser,
  deleteUser,
  verifyToken,
} from "./auth/auth.api";
import { changePassword } from "./auth/forgetPassword";
import {
  createProject,
  getDashboardStats,
  getProjectDetails,
  getProjects,
  updateProject,
  deleteProject,
} from "./project/project.api";
import {
  createBlueprint,
  getBlueprints,
  getBlueprintDetails,
} from "./blueprint/blueprint.api";
import { globalSearch } from "./search/search.api";

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
    updateUser,
    deleteUser,
  },
  project: {
    createProject,
    getProjects,
    getProjectDetails,
    getDashboardStats,
    updateProject,
    deleteProject,
  },
  blueprint: {
    createBlueprint,
    getBlueprints,
    getBlueprintDetails,
  },
  search: {
    globalSearch,
  },
};

