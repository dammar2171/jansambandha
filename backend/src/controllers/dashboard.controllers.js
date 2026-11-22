import dashboardServices from '../sevices/dashboard.services.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const citizen = asyncHandler(async (req, res) => {
  const data = await dashboardServices.citizenDashboard(req.user);
  return res.status(200).json(new ApiResponse(200, 'Citizen dashboard', data));
});

const ward = asyncHandler(async (req, res) => {
  const data = await dashboardServices.wardDashboard(req.user);
  return res.status(200).json(new ApiResponse(200, 'Ward dashboard', data));
});

const department = asyncHandler(async (req, res) => {
  const data = await dashboardServices.departmentDashboard(req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, 'Department dashboard', data));
});

const admin = asyncHandler(async (req, res) => {
  const data = await dashboardServices.adminDashboard(req.user);
  return res.status(200).json(new ApiResponse(200, 'Admin dashboard', data));
});

const cao = asyncHandler(async (req, res) => {
  const data = await dashboardServices.caoDashboard(req.user);
  return res.status(200).json(new ApiResponse(200, 'CAO dashboard', data));
});

const contractor = asyncHandler(async (req, res) => {
  const data = await dashboardServices.contractorDashboard(req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, 'Contractor dashboard', data));
});

export default { citizen, ward, department, admin, cao, contractor };
