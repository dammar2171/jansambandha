import express from 'express';
import wardControllers from '../controllers/ward.controllers.js';
import authMiddleware from '../middlewares/authenticate.js';

const router = express.Router();

// Any authenticated user can list wards
router.get('/', authMiddleware.protect, wardControllers.listWards);

export default router;
