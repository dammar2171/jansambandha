import express from 'express';
import projectControllers from '../controllers/projects.controllers.js';
import validate from '../middlewares/validate.js';
import authMiddleware from '../middlewares/authenticate.js';
import validateObjectId from '../middlewares/validateObjectId.js';
import {
  createProjectSchema,
  updateProjectSchema,
} from '../libs/schemas/project.schema.js';
import {
  createReactionSchema,
  createCommentSchema,
  setRatingSchema,
} from '../libs/schemas/projectFeedback.schema.js';
import { createProjectUpdateSchema } from '../libs/schemas/projectUpdate.schema.js';

const router = express.Router();

// Any authenticated user; results are visibility-filtered in the service
router.get('/', authMiddleware.protect, projectControllers.listProjects);

// CAO / General Admin only
router.post(
  '/',
  authMiddleware.protect,
  validate(createProjectSchema),
  projectControllers.createProject,
);

// Public: anyone (no login) can see only PUBLIC projects
router.get('/public', projectControllers.listPublicProjects);

// Citizen: their own project ratings. Declared before "/:id" so the literal
// "mine" segment is never treated as a project id.
router.get(
  '/mine/feedback',
  authMiddleware.protect,
  projectControllers.listMyFeedback,
);

// Any authenticated user; access is visibility/assignment-filtered in the service
router.get(
  '/:id',
  authMiddleware.protect,
  validateObjectId('id'),
  projectControllers.getProjectById,
);

// CAO only: edit permitted project fields
router.patch(
  '/:id',
  authMiddleware.protect,
  validateObjectId('id'),
  validate(updateProjectSchema),
  projectControllers.updateProject,
);

// Download a project summary report
router.get(
  '/:id/download',
  authMiddleware.protect,
  validateObjectId('id'),
  projectControllers.downloadProjectReport,
);

// Citizen: create or change own like/dislike reaction
router.post(
  '/:id/reactions',
  authMiddleware.protect,
  validateObjectId('id'),
  validate(createReactionSchema),
  projectControllers.setReaction,
);

// Citizen: remove own reaction
router.delete(
  '/:id/reactions',
  authMiddleware.protect,
  validateObjectId('id'),
  projectControllers.removeReaction,
);

// Citizen: rate a public project 1-5 (with an optional note)
router.post(
  '/:id/rating',
  authMiddleware.protect,
  validateObjectId('id'),
  validate(setRatingSchema),
  projectControllers.setRating,
);

// Citizen: follow / unfollow a public project to get progress notifications
router.post(
  '/:id/follow',
  authMiddleware.protect,
  validateObjectId('id'),
  projectControllers.toggleFollow,
);

// Citizen: comment on a public project
router.post(
  '/:id/comments',
  authMiddleware.protect,
  validateObjectId('id'),
  validate(createCommentSchema),
  projectControllers.addComment,
);

// Comment author or moderator (CAO / General Admin): delete a comment
router.delete(
  '/:id/comments/:commentId',
  authMiddleware.protect,
  validateObjectId('id'),
  validateObjectId('commentId'),
  projectControllers.deleteComment,
);

// Any citizen: report a comment for moderation
router.post(
  '/:id/comments/:commentId/report',
  authMiddleware.protect,
  validateObjectId('id'),
  validateObjectId('commentId'),
  projectControllers.reportComment,
);

// Anyone allowed to view the project: reaction counts + visible comments
router.get(
  '/:id/feedback',
  authMiddleware.protect,
  validateObjectId('id'),
  projectControllers.getProjectFeedback,
);

// Assigned contractor: submit a progress update
router.post(
  '/:id/progress-updates',
  authMiddleware.protect,
  validateObjectId('id'),
  validate(createProjectUpdateSchema),
  projectControllers.submitProgressUpdate,
);

// Assigned contractor / assigned department / CAO / General Admin: view updates
router.get(
  '/:id/progress-updates',
  authMiddleware.protect,
  validateObjectId('id'),
  projectControllers.listProgressUpdates,
);

// Assigned department / CAO / General Admin: reported vs verified progress
router.get(
  '/:id/progress-comparison',
  authMiddleware.protect,
  validateObjectId('id'),
  projectControllers.getProgressComparison,
);

export default router;