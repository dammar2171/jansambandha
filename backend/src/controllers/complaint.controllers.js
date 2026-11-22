import complaintServices from '../sevices/complaint.services.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const createComplaint = asyncHandler(async (req, res) => {
  const data = await complaintServices.createComplaint(req.user, req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, 'Complaint submitted successfully', data));
});

const listComplaints = asyncHandler(async (req, res) => {
  const data = await complaintServices.listComplaints(req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Complaints fetched successfully', data));
});

export default { createComplaint, listComplaints };
