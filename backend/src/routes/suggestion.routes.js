import express from 'express';
import suggestionControllers from '../controllers/suggestion.controllers.js';
import validate from '../middlewares/validate.js';
import authMiddleware from '../middlewares/authenticate.js';
import { createSuggestionSchema } from '../libs/schemas/suggestion.schema.js';

const router = express.Router();

// Citizen: suggest a project to their ward
router.post(
  '/',
  authMiddleware.protect,
  validate(createSuggestionSchema),
  suggestionControllers.createSuggestion,
);

// Citizen (own), Ward Chair (their ward), CAO / General Admin (municipality)
router.get('/', authMiddleware.protect, suggestionControllers.listSuggestions);

export default router;
