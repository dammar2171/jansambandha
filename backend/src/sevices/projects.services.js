import Project from '../models/Project.js';
import ProjectProposal from '../models/ProjectProposal.js';
import ProjectFeedback from '../models/ProjectFeedback.js';
import ProjectUpdate from '../models/ProjectUpadates.js';
import ProjectInspection from '../models/ProjectInspect.js';
import { AppError } from '../utils/AppError.js';
import {
  ROLES,
  PROPOSAL_STATUS,
  PROJECT_VISIBILITY,
  FEEDBACK_REACTION,
  MODERATION_STATUS,
} from '../constants/index.js';

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

// Attach like/dislike counts, visible comment count, and latest verified
// progress so a project list is useful on its own (one query each, no N+1).
const enrichProjects = async (projects) => {
  if (projects.length === 0) return projects;
  const ids = projects.map((p) => p._id);

  const [feedback, inspections] = await Promise.all([
    ProjectFeedback.find({
      projectId: { $in: ids },
      moderationStatus: MODERATION_STATUS.VISIBLE,
    })
      .select('projectId reaction comment')
      .lean(),
    ProjectInspection.find({ projectId: { $in: ids } })
      .select('projectId verifiedProgress inspectionDate')
      .sort({ inspectionDate: -1 })
      .lean(),
  ]);

  const stats = new Map();
  for (const f of feedback) {
    const key = String(f.projectId);
    const s = stats.get(key) || { up: 0, down: 0, comments: 0 };
    if (f.reaction === FEEDBACK_REACTION.LIKE) s.up += 1;
    else if (f.reaction === FEEDBACK_REACTION.DISLIKE) s.down += 1;
    if (f.comment && f.comment.trim()) s.comments += 1;
    stats.set(key, s);
  }

  // inspections are sorted newest first, so the first per project is the latest
  const verified = new Map();
  for (const insp of inspections) {
    const key = String(insp.projectId);
    if (!verified.has(key)) verified.set(key, insp.verifiedProgress);
  }

  return projects.map((p) => {
    const s = stats.get(String(p._id)) || { up: 0, down: 0, comments: 0 };
    return {
      ...p,
      reactions: { up: s.up, down: s.down },
      commentCount: s.comments,
      verifiedProgress: verified.get(String(p._id)) ?? 0,
    };
  });
};

const listProjects = async (user) => {
  const projects = await Project.find(buildVisibilityFilter(user))
    .populate('wardId', 'wardNumber name')
    .populate('departmentId', 'name')
    .sort({ createdAt: -1 })
    .lean();
  return enrichProjects(projects);
};

const listPublicProjects = async () => {
  return Project.find({ visibility: PROJECT_VISIBILITY.PUBLIC }).sort({
    createdAt: -1,
  });
};

const getProjectById = async (user, id) => {
  // Reusing the visibility filter means inaccessible projects simply read as "not found"
  const project = await Project.findOne({
    _id: id,
    ...buildVisibilityFilter(user),
  })
    .populate('wardId', 'wardNumber name')
    .populate('departmentId', 'name')
    .lean();
  if (!project) {
    throw new AppError('Project not found', 404);
  }
  const [enriched] = await enrichProjects([project]);
  return enriched;
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

const updateProject = async (user, id, updates) => {
  // 1. Only CAO can edit projects
  if (user.role !== ROLES.CAO) {
    throw new AppError('You are not allowed to edit projects', 403);
  }

  // 2. Find the project
  const project = await Project.findById(id);
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // 3. Apply the validated updates and save
  Object.assign(project, updates);
  await project.save();
  return project;
};

// Who may download a project report:
//   - CAO / General Admin: any project
//   - Ward Chair: their ward; Department: their department; Contractor: assigned project
const canDownloadProject = (user, project) => {
  switch (user.role) {
    case ROLES.CAO:
    case ROLES.GENERAL_ADMIN:
      return true;
    case ROLES.WARD_CHAIR:
      return String(project.wardId) === String(user.wardId);
    case ROLES.DEPARTMENT:
      return String(project.departmentId) === String(user.departmentId);
    case ROLES.CONTRACTOR:
      return String(project.contractorId) === String(user._id);
    default:
      return false;
  }
};

const getProjectReport = async (user, id) => {
  const project = await Project.findById(id);
  if (!project) {
    throw new AppError('Project not found', 404);
  }
  if (!canDownloadProject(user, project)) {
    throw new AppError(
      'You are not allowed to download this project report',
      403,
    );
  }
  return project;
};

// Citizens may only react to / comment on public projects
const assertPublicProject = async (projectId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404);
  }
  if (project.visibility !== PROJECT_VISIBILITY.PUBLIC) {
    throw new AppError('This project is not open for public feedback', 403);
  }
  return project;
};

const setReaction = async (user, projectId, reaction) => {
  if (user.role !== ROLES.CITIZEN) {
    throw new AppError('Only citizens can react to projects', 403);
  }
  await assertPublicProject(projectId);

  // One feedback doc per user/project; create it or change the reaction
  return ProjectFeedback.findOneAndUpdate(
    { projectId, userId: user._id },
    { $set: { reaction } },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
  );
};

const removeReaction = async (user, projectId) => {
  if (user.role !== ROLES.CITIZEN) {
    throw new AppError('Only citizens can react to projects', 403);
  }

  const feedback = await ProjectFeedback.findOne({
    projectId,
    userId: user._id,
  });
  if (!feedback || !feedback.reaction) {
    throw new AppError('No reaction to remove', 404);
  }

  // Keep the document if a comment remains; otherwise remove it entirely
  if (feedback.comment) {
    feedback.reaction = null;
    await feedback.save();
    return feedback;
  }
  await feedback.deleteOne();
  return null;
};

const addComment = async (user, projectId, comment) => {
  if (user.role !== ROLES.CITIZEN) {
    throw new AppError('Only citizens can comment on projects', 403);
  }
  await assertPublicProject(projectId);

  return ProjectFeedback.findOneAndUpdate(
    { projectId, userId: user._id },
    { $set: { comment } },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
  );
};

const getProjectFeedback = async (user, projectId) => {
  // Anyone allowed to view the project can see its feedback
  const project = await Project.findOne({
    _id: projectId,
    ...buildVisibilityFilter(user),
  });
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const [likes, dislikes, comments, mine] = await Promise.all([
    ProjectFeedback.countDocuments({
      projectId,
      reaction: FEEDBACK_REACTION.LIKE,
    }),
    ProjectFeedback.countDocuments({
      projectId,
      reaction: FEEDBACK_REACTION.DISLIKE,
    }),
    ProjectFeedback.find({
      projectId,
      moderationStatus: MODERATION_STATUS.VISIBLE,
      comment: { $ne: null },
    })
      .select('userId comment createdAt')
      .populate('userId', 'fullName')
      .sort({ createdAt: -1 }),
    ProjectFeedback.findOne({ projectId, userId: user._id }).select('reaction'),
  ]);

  return {
    reactions: { likes, dislikes },
    myReaction: mine?.reaction ?? null,
    comments,
  };
};

const deleteComment = async (user, projectId, commentId) => {
  const feedback = await ProjectFeedback.findOne({
    _id: commentId,
    projectId,
  });
  if (!feedback || !feedback.comment) {
    throw new AppError('Comment not found', 404);
  }

  // The comment author or a moderator (CAO / General Admin) may delete it
  const isAuthor = String(feedback.userId) === String(user._id);
  const isModerator = [ROLES.CAO, ROLES.GENERAL_ADMIN].includes(user.role);
  if (!isAuthor && !isModerator) {
    throw new AppError('You are not allowed to delete this comment', 403);
  }

  // Keep the document if a reaction remains; otherwise remove it entirely
  if (feedback.reaction) {
    feedback.comment = null;
    await feedback.save();
    return feedback;
  }
  await feedback.deleteOne();
  return null;
};

// Who may view progress updates: assigned contractor, assigned department, CAO / General Admin
const canViewProgress = (user, project) => {
  switch (user.role) {
    case ROLES.CAO:
    case ROLES.GENERAL_ADMIN:
      return true;
    case ROLES.CONTRACTOR:
      return String(project.contractorId) === String(user._id);
    case ROLES.DEPARTMENT:
      return String(project.departmentId) === String(user.departmentId);
    default:
      return false;
  }
};

// Who may compare progress: assigned department, CAO / General Admin (not the contractor)
const canCompareProgress = (user, project) => {
  if ([ROLES.CAO, ROLES.GENERAL_ADMIN].includes(user.role)) {
    return true;
  }
  if (user.role === ROLES.DEPARTMENT) {
    return String(project.departmentId) === String(user.departmentId);
  }
  return false;
};

const submitProgressUpdate = async (user, projectId, input) => {
  if (user.role !== ROLES.CONTRACTOR) {
    throw new AppError(
      'Only the assigned contractor can submit progress updates',
      403,
    );
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404);
  }
  if (String(project.contractorId) !== String(user._id)) {
    throw new AppError('You are not assigned to this project', 403);
  }

  return ProjectUpdate.create({
    projectId: project._id,
    contractorId: user._id,
    reportedProgress: input.reportedProgress,
    workDescription: input.workDescription,
    evidenceUrls: input.evidenceUrls,
    periodFrom: input.periodFrom,
    periodTo: input.periodTo,
  });
};

const listProgressUpdates = async (user, projectId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404);
  }
  if (!canViewProgress(user, project)) {
    throw new AppError('You are not allowed to view progress updates', 403);
  }
  return ProjectUpdate.find({ projectId }).sort({ createdAt: -1 });
};

const getProgressComparison = async (user, projectId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404);
  }
  if (!canCompareProgress(user, project)) {
    throw new AppError('You are not allowed to view progress comparison', 403);
  }

  const [updates, inspections] = await Promise.all([
    ProjectUpdate.find({ projectId }).sort({ createdAt: -1 }),
    ProjectInspection.find({ projectId }),
  ]);

  // Index inspections by the update they verified
  const inspectionByUpdate = new Map(
    inspections.map((i) => [String(i.progressUpdateId), i]),
  );

  return updates.map((u) => {
    const inspection = inspectionByUpdate.get(String(u._id));
    const verified = inspection ? inspection.verifiedProgress : null;
    return {
      updateId: u._id,
      periodFrom: u.periodFrom,
      periodTo: u.periodTo,
      reportedProgress: u.reportedProgress,
      verifiedProgress: verified,
      difference: verified === null ? null : u.reportedProgress - verified,
      qualityStatus: inspection ? inspection.qualityStatus : null,
      inspected: Boolean(inspection),
    };
  });
};

const listMyProjects = async (user) => {
  if (user.role !== ROLES.CONTRACTOR) {
    throw new AppError(
      'Only contractors can view their assigned projects',
      403,
    );
  }
  return Project.find({ contractorId: user._id }).sort({ createdAt: -1 });
};

export default {
  listProjects,
  listPublicProjects,
  getProjectById,
  createProject,
  updateProject,
  getProjectReport,
  setReaction,
  removeReaction,
  addComment,
  getProjectFeedback,
  deleteComment,
  submitProgressUpdate,
  listProgressUpdates,
  getProgressComparison,
  listMyProjects,
};
