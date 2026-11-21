import express from 'express';
import projectProposalControllers from '../controllers/projectProposal.controllers.js';
import validate from '../middlewares/validate.js';
import authMiddleware from '../middlewares/authenticate.js';
import validateObjectId from '../middlewares/validateObjectId.js';
import {
  createProjectProposalSchema,
  updateProjectProposalSchema,
} from '../libs/schemas/projectProposal.schema.js';

const router = express.Router();

router.post(
  '/',
  validate(createProjectProposalSchema),
  projectProposalControllers.createProjectProposal,
);

router.get(
  '/',
  authMiddleware.protect,
  projectProposalControllers.listProjectProposals,
);

router.get('/test', (req, res) => {
  res.json({ message: 'Project proposal route is working!' });
});

router.get(
  '/:id',
  authMiddleware.protect,
  validateObjectId('id'),
  projectProposalControllers.getProjectProposalById,
);

router.patch(
  '/:id',
  authMiddleware.protect,
  validateObjectId('id'),
  validate(updateProjectProposalSchema),
  projectProposalControllers.updateProjectProposal,
);

router.post(
  '/:id/submit',
  authMiddleware.protect,
  validateObjectId('id'),
  projectProposalControllers.submitProjectProposal,
);

export default router;
