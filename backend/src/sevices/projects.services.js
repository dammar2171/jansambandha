import Project from '../models/Project.js';
import ProjectProposal from '../models/ProjectProposal.js';
import { AppError } from '../utils/AppError.js';
import { ROLES, PROPOSAL_STATUS, PROJECT_VISIBILITY } from '../constants/index.js';

// Which projects a user may see:
//   - everyone sees PUBLIC projects
//   - CAO / General Admin see everything
//   - contractor / department / ward chair also see their own INTERNAL projects
const buildVisibilityFilter = (user) => {
  if ([ROLES.CAO, ROLES.GENERAL_ADMIN].includes(user.role)) {
    return {};
  }

  const or = [{ visibility: PROJECT_VISIBILITY.PUBLIC }];
  if (user.role === ROLES.CONTRACTOR) {
    or.push({ contractorId: user._id });
  } else if (user.role === ROLES.DEPARTMENT) {
    or.push({ departmentId: user.departmentId });
  } else if (user.role === ROLES.WARD_CHAIR) {
    or.push({ wardId: user.wardId });
  }
  return { $or: or };
};

const listProjects = async (user) => {
  return Project.find(buildVisibilityFilter(user)).sort({ createdAt: -1 });
};

const getProjectById = async (user, id) => {
  // Reusing the visibility filter means inaccessible projects simply read as "not found"
  const project = await Project.findOne({
    _id: id,
    ...buildVisibilityFilter(user),
  });
  if (!project) {
    throw new AppError('Project not found', 404);
  }
  return project;
};

const createProject = async (user, input) => {
  // 1. Only CAO and General Admin can create projects
  if (![ROLES.CAO, ROLES.GENERAL_ADMIN].includes(user.role)) {
    throw new AppError('You are not allowed to create projects', 403);
  }

  // 2. Fields common to both creation modes. municipalityId comes from the creator.
  const data = {
    municipalityId: user.municipalityId,
    approvedBudget: input.approvedBudget,
    contractorId: input.contractorId,
    departmentId: input.departmentId,
    startDate: input.startDate,
    endDate: input.endDate,
    visibility: input.visibility,
  };

  if (input.proposalId) {
    // 3a. From an authorized (admin-approved) proposal
    const proposal = await ProjectProposal.findById(input.proposalId);
    if (!proposal) {
      throw new AppError('Project proposal not found', 404);
    }
    if (proposal.status !== PROPOSAL_STATUS.ADMIN_APPROVED) {
      throw new AppError('Only approved proposals can become projects', 400);
    }
    data.proposalId = proposal._id;
    data.title = proposal.title;
    data.description = proposal.description;
    data.wardId = proposal.wardId;
    data.fiscalYear = proposal.fiscalYear;
  } else {
    // 3b. A permitted project created directly
    data.title = input.title;
    data.description = input.description;
    data.wardId = input.wardId;
    data.fiscalYear = input.fiscalYear;
  }

  // 4. Create it (status defaults to APPROVED, visibility to PUBLIC)
  return Project.create(data);
};

export default { listProjects, getProjectById, createProject };
