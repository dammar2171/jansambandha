import analyticsServices from '../sevices/analytics.services.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const municipality = asyncHandler(async (req, res) => {
  const data = await analyticsServices.municipalityAnalytics(req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, 'Municipality analytics', data));
});

const wards = asyncHandler(async (req, res) => {
  const data = await analyticsServices.wardAnalytics(req.user);
  return res.status(200).json(new ApiResponse(200, 'Ward analytics', data));
});

export default { municipality, wards };
