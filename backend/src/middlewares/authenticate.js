import {
  CITZEN_ROLE,
  WARD_ROLE,
  CONTRACTOR_ROLE,
  DEPARTMENT_ROLE,
  GENERAL_ADMIN_ROLE,
  CAO_ROLE,
} from "../helper/constants.js";
import User from "../models/User.js";
import ApiResponse from "../utils/apiResponse.js";
import { verifyAccessToken } from "../utils/jwt.js";

const hasRole = (user, roles) => {
  if (!user) return false;
  const userRoles = Array.isArray(user.role) ? user.role : [user.role];
  return roles.some((role) => userRoles.includes(role));
};

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json(new ApiResponse(401, "Not authorized, no token"));
    }

    const decoded = verifyAccessToken(authHeader.split(" ")[1]);

    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) {
      return res
        .status(401)
        .json(new ApiResponse(401, "Not authorized, user not found"));
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json(new ApiResponse(401, "Not authorized, token failed"));
  }
};

const requireRole = (role, message) => (req, res, next) => {
  if (hasRole(req.user, [role])) {
    return next();
  }
  return res.status(403).json(new ApiResponse(403, message));
};

const isCitizen = requireRole(CITZEN_ROLE, "Not authorized as citizen");
const isWard = requireRole(WARD_ROLE, "Not authorized as ward");
const isContractor = requireRole(
  CONTRACTOR_ROLE,
  "Not authorized as contractor"
);
const isDepartment = requireRole(
  DEPARTMENT_ROLE,
  "Not authorized as department"
);
const isGeneralAdmin = requireRole(
  GENERAL_ADMIN_ROLE,
  "Not authorized as general admin"
);
const isCao = requireRole(CAO_ROLE, "Not authorized as CAO");

export default {
  protect,
  hasRole,
  isCitizen,
  isWard,
  isContractor,
  isDepartment,
  isGeneralAdmin,
  isCao,
};
