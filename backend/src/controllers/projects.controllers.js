import projectServices from '../sevices/projects.services.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const listProjects = asyncHandler(async (req, res) => {
  const data = await projectServices.listProjects(req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Projects fetched successfully', data));
});

const listPublicProjects = asyncHandler(async (req, res) => {
  const data = await projectServices.listPublicProjects();

  return res
    .status(200)
    .json(new ApiResponse(200, 'Public projects fetched successfully', data));
});

const createProject = asyncHandler(async (req, res) => {
  const data = await projectServices.createProject(req.user, req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, 'Project created successfully', data));
});

const getProjectById = asyncHandler(async (req, res) => {
  const data = await projectServices.getProjectById(req.user, req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Project fetched successfully', data));
});

const updateProject = asyncHandler(async (req, res) => {
  const data = await projectServices.updateProject(
    req.user,
    req.params.id,
    req.body,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, 'Project updated successfully', data));
});

const buildProjectReport = (p) => {
  return [
    'PROJECT SUMMARY REPORT',
    '======================',
    `ID:              ${p._id}`,
    `Title:           ${p.title}`,
    `Description:     ${p.description}`,
    `Status:          ${p.status}`,
    `Visibility:      ${p.visibility}`,
    `Fiscal Year:     ${p.fiscalYear}`,
    `Approved Budget: ${p.approvedBudget}`,
    `Ward:            ${p.wardId}`,
    `Department:      ${p.departmentId}`,
    `Contractor:      ${p.contractorId ?? 'Not assigned'}`,
    `Start Date:      ${p.startDate ?? 'Not set'}`,
    `End Date:        ${p.endDate ?? 'Not set'}`,
    `Created At:      ${p.createdAt}`,
  ].join('\n');
};

const downloadProjectReport = asyncHandler(async (req, res) => {
  const project = await projectServices.getProjectReport(
    req.user,
    req.params.id,
  );
  const report = buildProjectReport(project);

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="project-${project._id}.txt"`,
  );
  return res.status(200).send(report);
});

const setReaction = asyncHandler(async (req, res) => {
  const data = await projectServices.setReaction(
    req.user,
    req.params.id,
    req.body.reaction,
  );

  return res.status(200).json(new ApiResponse(200, 'Reaction saved', data));
});

const removeReaction = asyncHandler(async (req, res) => {
  await projectServices.removeReaction(req.user, req.params.id);

  return res.status(200).json(new ApiResponse(200, 'Reaction removed'));
});

const addComment = asyncHandler(async (req, res) => {
  const data = await projectServices.addComment(
    req.user,
    req.params.id,
    req.body.comment,
  );

  return res.status(201).json(new ApiResponse(201, 'Comment added', data));
});

const setRating = asyncHandler(async (req, res) => {
  const data = await projectServices.setRating(
    req.user,
    req.params.id,
    req.body,
  );

  return res.status(200).json(new ApiResponse(200, 'Rating saved', data));
});

const listMyFeedback = asyncHandler(async (req, res) => {
  const data = await projectServices.listMyFeedback(req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Your feedback fetched successfully', data));
});

const toggleFollow = asyncHandler(async (req, res) => {
  const data = await projectServices.toggleFollow(req.user, req.params.id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        data.following ? 'Following project' : 'Unfollowed project',
        data,
      ),
    );
});

const reportComment = asyncHandler(async (req, res) => {
  await projectServices.reportComment(
    req.user,
    req.params.id,
    req.params.commentId,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, 'Comment reported to the moderators'));
});

const getProjectFeedback = asyncHandler(async (req, res) => {
  const data = await projectServices.getProjectFeedback(
    req.user,
    req.params.id,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, 'Project feedback fetched', data));
});

const deleteComment = asyncHandler(async (req, res) => {
  await projectServices.deleteComment(
    req.user,
    req.params.id,
    req.params.commentId,
  );

  return res.status(200).json(new ApiResponse(200, 'Comment deleted'));
});

const submitProgressUpdate = asyncHandler(async (req, res) => {
  const data = await projectServices.submitProgressUpdate(
    req.user,
    req.params.id,
    req.body,
  );

  return res
    .status(201)
    .json(new ApiResponse(201, 'Progress update submitted successfully', data));
});

const listProgressUpdates = asyncHandler(async (req, res) => {
  const data = await projectServices.listProgressUpdates(
    req.user,
    req.params.id,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, 'Progress updates fetched successfully', data));
});

const getProgressComparison = asyncHandler(async (req, res) => {
  const data = await projectServices.getProgressComparison(
    req.user,
    req.params.id,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, 'Progress comparison fetched successfully', data),
    );
});

const listMyProjects = asyncHandler(async (req, res) => {
  const data = await projectServices.listMyProjects(req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Your projects fetched successfully', data));
});

export default {
  listProjects,
  listPublicProjects,
  createProject,
  getProjectById,
  updateProject,
  downloadProjectReport,
  setReaction,
  removeReaction,
  addComment,
  getProjectFeedback,
  deleteComment,
  setRating,
  listMyFeedback,
  toggleFollow,
  reportComment,
  submitProgressUpdate,
  listProgressUpdates,
  getProgressComparison,
  listMyProjects,
};
