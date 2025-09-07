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
import {
  createProject,
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
    googleSignUp,
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
    getBlueprintDetails,
  },
};
