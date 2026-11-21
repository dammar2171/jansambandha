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

export default { createProjectProposal, listProjectProposals };
