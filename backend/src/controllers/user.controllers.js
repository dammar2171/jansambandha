import userServices from '../sevices/user.services.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const listUsers = asyncHandler(async (req, res) => {
  const data = await userServices.listUsers(req.user, req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Users fetched successfully', data));
});

const createOfficialUser = asyncHandler(async (req, res) => {
  const data = await userServices.createOfficialUser(req.user, req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, 'Account created successfully', data));
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const data = await userServices.updateUserStatus(
    req.user,
    req.params.id,
    req.body.accountStatus,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, 'Account status updated successfully', data));
});

export default { listUsers, createOfficialUser, updateUserStatus };
