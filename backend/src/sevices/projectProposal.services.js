import ProjectProposal from '../models/ProjectProposal.js';
import ProjectApproval from '../models/ProjectApproval.js';
import { AppError } from '../utils/AppError.js';
import {
  APPROVAL_ACTION,
  APPROVAL_DECISION,
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

const updateProjectProposal = async (user, id, updates) => {
  // 1. Only ward chairpersons and admins can edit
  if (![ROLES.WARD_CHAIR, ROLES.CAO, ROLES.GENERAL_ADMIN].includes(user.role)) {
    throw new AppError('You are not allowed to edit project proposals', 403);
  }

  // 2. Find the proposal
  const proposal = await ProjectProposal.findById(id);
  if (!proposal) {
    throw new AppError('Project proposal not found', 404);
  }

  // 3. Ward chairpersons may only edit drafts in their own ward
  if (user.role === ROLES.WARD_CHAIR) {
    if (String(proposal.wardId) !== String(user.wardId)) {
      throw new AppError(
        'You are not allowed to edit this project proposal',
        403,
      );
    }
    if (proposal.status !== PROPOSAL_STATUS.DRAFT) {
      throw new AppError(
        'Ward chairpersons can only edit draft proposals',
        400,
      );
    }
  }

  // 4. Apply the validated updates and save
  Object.assign(proposal, updates);
  await proposal.save();
  return proposal;
};

const submitProjectProposal = async (user, id) => {
  // 1. Only ward chairpersons can submit
  if (user.role !== ROLES.WARD_CHAIR) {
    throw new AppError('Only ward chairpersons can submit proposals', 403);
  }

  // 2. Find the proposal
  const proposal = await ProjectProposal.findById(id);
  if (!proposal) {
    throw new AppError('Project proposal not found', 404);
  }

  // 3. Must be a draft in the ward chair's own ward
  if (String(proposal.wardId) !== String(user.wardId)) {
    throw new AppError(
      'You are not allowed to submit this project proposal',
      403,
    );
  }
  if (proposal.status !== PROPOSAL_STATUS.DRAFT) {
    throw new AppError('Only draft proposals can be submitted', 400);
  }

  // 4. Move into the review workflow
  proposal.status = PROPOSAL_STATUS.SUBMITTED;
  proposal.submittedAt = new Date();
  await proposal.save();
  return proposal;
};

const addReview = async (user, id, { note }) => {
  // 1. Department, General Admin, and CAO can add review notes
  if (![ROLES.DEPARTMENT, ROLES.GENERAL_ADMIN, ROLES.CAO].includes(user.role)) {
    throw new AppError('You are not allowed to review project proposals', 403);
  }

  // 2. Find the proposal
  const proposal = await ProjectProposal.findById(id);
  if (!proposal) {
    throw new AppError('Project proposal not found', 404);
  }

  // 3. Department writes a technical review; admins write an administrative one
  const action =
    user.role === ROLES.DEPARTMENT
      ? APPROVAL_ACTION.TECHNICAL_REVIEW
      : APPROVAL_ACTION.ADMIN_REVIEW;

  // 4. Record the note on the proposal's timeline
  return ProjectApproval.create({
    proposalId: proposal._id,
    action,
    decision: APPROVAL_DECISION.NOTED,
    actorUserId: user._id,
    remarks: note,
    decisionDate: new Date(),
  });
};

// Maps an administrative decision to its approval action and resulting status
const DECISION_OUTCOME = {
  [APPROVAL_DECISION.APPROVED]: {
    action: APPROVAL_ACTION.ADMIN_APPROVAL,
    status: PROPOSAL_STATUS.ADMIN_APPROVED,
  },
  [APPROVAL_DECISION.RETURNED]: {
    action: APPROVAL_ACTION.RETURN,
    status: PROPOSAL_STATUS.RETURNED,
  },
  [APPROVAL_DECISION.REJECTED]: {
    action: APPROVAL_ACTION.REJECTION,
    status: PROPOSAL_STATUS.REJECTED,
  },
};

const recordAdministrativeDecision = async (user, id, { decision, reason }) => {
  // 1. Only CAO and General Admin can record a decision
  if (![ROLES.CAO, ROLES.GENERAL_ADMIN].includes(user.role)) {
    throw new AppError(
      'You are not allowed to decide on project proposals',
      403,
    );
  }

  // 2. Find the proposal
  const proposal = await ProjectProposal.findById(id);
  if (!proposal) {
    throw new AppError('Project proposal not found', 404);
  }

  // 3. A draft has not entered the workflow yet
  if (proposal.status === PROPOSAL_STATUS.DRAFT) {
    throw new AppError('Only submitted proposals can be decided', 400);
  }

  // 4. Record the decision, then move the proposal to its new status
  const outcome = DECISION_OUTCOME[decision];

  const approval = await ProjectApproval.create({
    proposalId: proposal._id,
    action: outcome.action,
    decision,
    actorUserId: user._id,
    remarks: reason,
    decisionDate: new Date(),
  });

  proposal.status = outcome.status;
  await proposal.save();

  return approval;
};

const getProposalHistory = async (user, id) => {
  // 1. Only reviewing roles can view the timeline
  if (!PROPOSAL_VIEWER_ROLES.includes(user.role)) {
    throw new AppError('You are not allowed to view project proposals', 403);
  }

  // 2. Find the proposal
  const proposal = await ProjectProposal.findById(id);
  if (!proposal) {
    throw new AppError('Project proposal not found', 404);
  }

  // 3. Ward chairpersons can only view their own ward
  if (
    user.role === ROLES.WARD_CHAIR &&
    String(proposal.wardId) !== String(user.wardId)
  ) {
    throw new AppError(
      'You are not allowed to view this project proposal',
      403,
    );
  }

  // 4. Return the review/decision timeline, oldest first
  return ProjectApproval.find({ proposalId: proposal._id }).sort({
    decisionDate: 1,
    createdAt: 1,
  });
};

export default {
  createProjectProposal,
  listProjectProposals,
  getProjectProposalById,
  updateProjectProposal,
  submitProjectProposal,
  addReview,
  recordAdministrativeDecision,
  getProposalHistory,
};
