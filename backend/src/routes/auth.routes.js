import express from 'express';
import authControllers from '../controllers/auth.controllers.js';
import validate from '../middlewares/validate.js';
import {
  citizenRegisterSchema,
  citizenLoginSchema,
} from '../libs/schemas/user.schema.js';

const router = express.Router();

router.post(
  '/register',
  validate(citizenRegisterSchema),
  authControllers.registerCitizen,
);

router.post(
  '/login',
  validate(citizenLoginSchema),
  authControllers.loginCitizen,
);

export default router;
