import express from 'express';
import progressUpdateControllers from '../controllers/progressUpdate.controllers.js';
import validate from '../middlewares/validate.js';
import authMiddleware from '../middlewares/authenticate.js';
import validateObjectId from '../middlewares/validateObjectId.js';
import {
  verifyProgressSchema,
  requestCorrectionSchema,
} from '../libs/schemas/projectInspect.schema.js';

const router = express.Router();

// Assigned department: record verified progress and an inspection note
router.post(
  '/:id/verify',
  authMiddleware.protect,
  validateObjectId('id'),
  validate(verifyProgressSchema),
  progressUpdateControllers.verifyProgressUpdate,
);

// Assigned department: ask the contractor for a correction
router.post(
  '/:id/request-correction',
  authMiddleware.protect,
  validateObjectId('id'),
  validate(requestCorrectionSchema),
  progressUpdateControllers.requestCorrection,
);

export default router;
