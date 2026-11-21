import ProjectProposal from '../models/ProjectProposal.js';
import { AppError } from '../utils/AppError.js';
import {
  MONGODB_OBJECT_ID_REGEX,
  PROPOSAL_STATUS,
  PROPOSAL_VIEWER_ROLES,
  ROLES,
} from '../constants/index.js';

const createProjectProposal = async (input) => {
  const proposal = await ProjectProposal.create(input);
  return proposal;
};

const listProjectProposals = async (user, query) => {
  // 1. Only reviewing roles can list proposals
  if (!PROPOSAL_VIEWER_ROLES.includes(user.role)) {
    throw new AppError('You are not allowed to view project proposals', 403);
  }

  const filter = {};

  // 2. Ward chairpersons only see their own ward.
  //    Other roles may optionally filter by ward.
  if (user.role === ROLES.WARD_CHAIR) {
    filter.wardId = user.wardId;
  } else if (query.wardId) {
    if (!MONGODB_OBJECT_ID_REGEX.test(query.wardId)) {
      throw new AppError('Invalid ward ID', 400);
    }
    filter.wardId = query.wardId;
  }

  // 3. Optional status filter
  if (query.status) {
    if (!Object.values(PROPOSAL_STATUS).includes(query.status)) {
      throw new AppError('Invalid status value', 400);
    }
    filter.status = query.status;
  }

  // 4. Return matching proposals, newest first
  return ProjectProposal.find(filter).sort({ createdAt: -1 });
};

const getProjectProposalById = async (user, id) => {
  // 1. Only reviewing roles can view proposals
  if (!PROPOSAL_VIEWER_ROLES.includes(user.role)) {
    throw new AppError('You are not allowed to view project proposals', 403);
  }

  // 2. Find the proposal
  const proposal = await ProjectProposal.findById(id);
  if (!proposal) {
    throw new AppError('Project proposal not found', 404);
  }

  // 3. Ward chairpersons can only view proposals in their own ward
  if (
    user.role === ROLES.WARD_CHAIR &&
    String(proposal.wardId) !== String(user.wardId)
  ) {
    throw new AppError(
      'You are not allowed to view this project proposal',
      403,
    );
  }

  return proposal;
};

export default {
  createProjectProposal,
  listProjectProposals,
  getProjectProposalById,
};
