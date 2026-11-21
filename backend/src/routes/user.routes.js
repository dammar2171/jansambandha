import express from 'express';
import userControllers from '../controllers/user.controllers.js';
import validate from '../middlewares/validate.js';
import authMiddleware from '../middlewares/authenticate.js';
import { createOfficialUserSchema } from '../libs/schemas/user.schema.js';

const router = express.Router();

router.get('/', authMiddleware.protect, userControllers.listUsers);

router.post(
  '/',
  authMiddleware.protect,
  validate(createOfficialUserSchema),
  userControllers.createOfficialUser,
);

export default router;
