import projectProposalServices from "../sevices/projectProposal.services.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createProjectProposal = asyncHandler(async(req,res)=>{
  const data = await projectProposalServices.createProjectProposal(req.body);

  return res.status(201).json(new ApiResponse(201,"Project proposal completed successfully!",data));
})

export default {createProjectProposal};