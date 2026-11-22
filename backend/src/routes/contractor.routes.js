import express from 'express';
import projectControllers from '../controllers/projects.controllers.js';
import authMiddleware from '../middlewares/authenticate.js';

const router = express.Router();

// Contractor: list projects assigned to me
router.get(
  '/my-projects',
  authMiddleware.protect,
  projectControllers.listMyProjects,
);

export default router;
