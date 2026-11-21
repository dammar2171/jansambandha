import express from 'express'
import authControllers from '../controllers/auth.controllers.js';
import validate from "../middlewares/validate.js";
import { citizenRegisterSchema } from '../libs/schemas/user.schema.js';

const router = express.Router();

router.post(
  "/register",
  validate(citizenRegisterSchema),
  authControllers.registerCitizen
);

export default router;