import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import authServices from '../sevices/auth.services.js';

const registerCitizen = asyncHandler(async (req, res) => {
  const data = await authServices.registerCitizen(req.body);
  res
    .status(201)
    .json(new ApiResponse(201, 'Citizen registered successfully', data));
});

const loginCitizen = asyncHandler(async (req, res) => {
  const data = await authServices.loginCitizen(req.body);
  res.status(200).json(new ApiResponse(200, 'Login successful', data));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(
      new ApiResponse(200, 'Current user retrieved successfully', req.user),
    );
});

const changePassword = asyncHandler(async (req, res) => {
  await authServices.changePassword(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, 'Password changed successfully'));
});

export default {
  registerCitizen,
  loginCitizen,
  getCurrentUser,
  changePassword,
};
