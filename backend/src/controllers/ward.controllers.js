import wardServices from '../sevices/ward.services.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const listWards = asyncHandler(async (req, res) => {
  const data = await wardServices.listWards();

  return res
    .status(200)
    .json(new ApiResponse(200, 'Wards fetched successfully', data));
});

export default { listWards };
