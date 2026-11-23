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

const getComplaintById = asyncHandler(async (req, res) => {
  const data = await complaintServices.getComplaintById(
    req.user,
    req.params.id,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, 'Complaint fetched successfully', data));
});

const updateComplaintStatus = asyncHandler(async (req, res) => {
  const data = await complaintServices.updateComplaintStatus(
    req.user,
    req.params.id,
    req.body,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, 'Complaint updated successfully', data));
});

const editComplaint = asyncHandler(async (req, res) => {
  const data = await complaintServices.editComplaint(
    req.user,
    req.params.id,
    req.body,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, 'Complaint updated successfully', data));
});

const addComplaintResponse = asyncHandler(async (req, res) => {
  const data = await complaintServices.addComplaintResponse(
    req.user,
    req.params.id,
    req.body.message,
  );

  return res
    .status(201)
    .json(new ApiResponse(201, 'Response sent successfully', data));
});

export default {
  createComplaint,
  listComplaints,
  getComplaintById,
  updateComplaintStatus,
  editComplaint,
  addComplaintResponse,
};
