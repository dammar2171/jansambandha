import projectProposalServices from '../sevices/projectProposal.services.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const createProjectProposal = asyncHandler(async (req, res) => {
  const data = await projectProposalServices.createProjectProposal(req.body);

  return res
    .status(201)
    .json(
      new ApiResponse(201, 'Project proposal completed successfully!', data),
    );
});

const listProjectProposals = asyncHandler(async (req, res) => {
  const data = await projectProposalServices.listProjectProposals(
    req.user,
    req.query,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, 'Project proposals fetched successfully', data));
});

const getProjectProposalById = asyncHandler(async (req, res) => {
  const data = await projectProposalServices.getProjectProposalById(
    req.user,
    req.params.id,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, 'Project proposal fetched successfully', data));
});

const updateProjectProposal = asyncHandler(async (req, res) => {
  const data = await projectProposalServices.updateProjectProposal(
    req.user,
    req.params.id,
    req.body,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, 'Project proposal updated successfully', data));
});

const submitProjectProposal = asyncHandler(async (req, res) => {
  const data = await projectProposalServices.submitProjectProposal(
    req.user,
    req.params.id,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, 'Project proposal submitted successfully', data),
    );
});

export default {
  createProjectProposal,
  listProjectProposals,
  getProjectProposalById,
  updateProjectProposal,
  submitProjectProposal,
};
