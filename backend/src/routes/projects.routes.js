import express from 'express';
import projectControllers from '../controllers/projects.controllers.js';
import validate from '../middlewares/validate.js';
import authMiddleware from '../middlewares/authenticate.js';
import validateObjectId from '../middlewares/validateObjectId.js';
import { createProjectSchema } from '../libs/schemas/project.schema.js';

const router = express.Router();

// Any authenticated users can see
router.get('/', authMiddleware.protect, projectControllers.listProjects);

// CAO / General Admin only
router.post(
  '/',
  authMiddleware.protect,
  validate(createProjectSchema),
  projectControllers.createProject,
);

// Public: anyone (no login) can see only PUBLIC visibility projects
router.get('/public', projectControllers.listPublicProjects);

// Any authenticated user; access is visibility/assignment-filtered in the service
router.get(
  '/:id',
  authMiddleware.protect,
  validateObjectId('id'),
  projectControllers.getProjectById,
);

export default router;
