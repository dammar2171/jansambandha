import express from 'express';
import authControllers from '../controllers/auth.controllers.js';
import validate from '../middlewares/validate.js';
import authMiddleware from '../middlewares/authenticate.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import {
  citizenRegisterSchema,
  citizenLoginSchema,
  changePasswordSchema,
} from '../libs/schemas/user.schema.js';

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  validate(citizenRegisterSchema),
  authControllers.registerCitizen,
);

router.post(
  '/login',
  authLimiter,
  validate(citizenLoginSchema),
  authControllers.loginCitizen,
);

router.get('/me', authMiddleware.protect, authControllers.getCurrentUser);

router.post(
  '/change-password',
  authMiddleware.protect,
  validate(changePasswordSchema),
  authControllers.changePassword,
);

export default router;
