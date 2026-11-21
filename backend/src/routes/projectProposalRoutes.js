import express from 'express';
import projectProposalControllers from '../controllers/projectProposal.controllers.js';
import validate from '../middlewares/validate.js';
import authMiddleware from '../middlewares/authenticate.js';
import { createProjectProposalSchema } from '../libs/schemas/projectProposal.schema.js';

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

export default router;
