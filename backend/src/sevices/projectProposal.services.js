import ProjectProposal from "../models/ProjectProposal.js";

const createProjectProposal = async (input) => {
  const proposal = await ProjectProposal.create(input);
  return proposal;
};

export default { createProjectProposal };