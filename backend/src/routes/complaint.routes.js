import express from 'express';
import complaintControllers from '../controllers/complaint.controllers.js';
import validate from '../middlewares/validate.js';
import authMiddleware from '../middlewares/authenticate.js';
import validateObjectId from '../middlewares/validateObjectId.js';
import {
  createComplaintSchema,
  updateComplaintSchema,
  createComplaintResponseSchema,
} from '../libs/schemas/complaint.schema.js';

const router = express.Router();

// Citizen: submit a complaint to a selected ward
router.post(
  '/',
  authMiddleware.protect,
  validate(createComplaintSchema),
  complaintControllers.createComplaint,
);

// Citizen (own), Ward Chair (ward), CAO / General Admin (all)
router.get('/', authMiddleware.protect, complaintControllers.listComplaints);

// Citizen (own), responsible ward chair, CAO / General Admin
router.get(
  '/:id',
  authMiddleware.protect,
  validateObjectId('id'),
  complaintControllers.getComplaintById,
);

// Ward Chair / General Admin / CAO: update status and responsible person
router.patch(
  '/:id/status',
  authMiddleware.protect,
  validateObjectId('id'),
  validate(updateComplaintSchema),
  complaintControllers.updateComplaintStatus,
);

// Ward Chair / General Admin / CAO: send an official response to the citizen
router.post(
  '/:id/responses',
  authMiddleware.protect,
  validateObjectId('id'),
  validate(createComplaintResponseSchema),
  complaintControllers.addComplaintResponse,
);

export default router;
