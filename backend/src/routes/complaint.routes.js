import express from 'express';
import complaintControllers from '../controllers/complaint.controllers.js';
import validate from '../middlewares/validate.js';
import authMiddleware from '../middlewares/authenticate.js';
import { createComplaintSchema } from '../libs/schemas/complaint.schema.js';

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

export default router;
