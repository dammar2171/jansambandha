import Project from '../models/Project.js';
import ProjectUpdate from '../models/ProjectUpadates.js';
import ProjectInspection from '../models/ProjectInspect.js';
import ProjectFollow from '../models/ProjectFollow.js';
import notificationServices from './notification.services.js';
import { AppError } from '../utils/AppError.js';
import { ROLES, UPDATE_STATUS, NOTIFICATION_TYPE } from '../constants/index.js';

// Load an update and confirm the caller is the assigned department for its project
const loadForAssignedDepartment = async (user, updateId) => {
  if (user.role !== ROLES.DEPARTMENT) {
    throw new AppError('Only the assigned department can do this', 403);
  }

  const update = await ProjectUpdate.findById(updateId);
  if (!update) {
    throw new AppError('Progress update not found', 404);
  }

  const project = await Project.findById(update.projectId);
  if (!project) {
    throw new AppError('Project not found', 404);
  }
  if (String(project.departmentId) !== String(user.departmentId)) {
    throw new AppError(
      'You are not the assigned department for this project',
      403,
    );
  }

  return { update, project };
};

const verifyProgressUpdate = async (user, updateId, input) => {
  const { update, project } = await loadForAssignedDepartment(user, updateId);

  // Record the department's inspection
  const inspection = await ProjectInspection.create({
    projectId: project._id,
    progressUpdateId: update._id,
    departmentId: project.departmentId,
    inspectorId: user._id,
    verifiedProgress: input.verifiedProgress,
    qualityStatus: input.qualityStatus,
    observations: input.observations,
    evidenceUrls: input.evidenceUrls,
    inspectionDate: input.inspectionDate ?? new Date(),
  });

  // Mark the update as verified
  update.status = UPDATE_STATUS.VERIFIED;
  await update.save();

  // Tell citizens following this project (fire-and-forget)
  ProjectFollow.find({ projectId: project._id })
    .select('userId')
    .lean()
    .then((follows) =>
      notificationServices.notifyMany(
        follows.map((f) => f.userId),
        {
          type: NOTIFICATION_TYPE.PROJECT,
          message: `Verified progress on "${project.title}" is now ${input.verifiedProgress}%`,
          link: `/citizen/projects/${project._id}`,
        },
      ),
    )
    .catch(() => {});

  return inspection;
};

const requestCorrection = async (user, updateId, note) => {
  const { update } = await loadForAssignedDepartment(user, updateId);

  update.status = UPDATE_STATUS.NEEDS_CORRECTION;
  update.reviewNote = note;
  await update.save();

  return update;
};

export default { verifyProgressUpdate, requestCorrection };
