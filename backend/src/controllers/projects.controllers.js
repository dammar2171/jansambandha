import projectServices from '../sevices/projects.services.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const listProjects = asyncHandler(async (req, res) => {
  const data = await projectServices.listProjects(req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, 'Projects fetched successfully', data));
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

export default { listProjects, createProject, getProjectById };
