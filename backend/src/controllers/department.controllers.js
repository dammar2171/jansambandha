import departmentServices from '../sevices/department.services.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const listDepartments = asyncHandler(async (req, res) => {
  const data = await departmentServices.listDepartments();

  return res
    .status(200)
    .json(new ApiResponse(200, 'Departments fetched successfully', data));
});

export default { listDepartments };
