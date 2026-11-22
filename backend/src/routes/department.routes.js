import express from 'express';
import departmentControllers from '../controllers/department.controllers.js';
import authMiddleware from '../middlewares/authenticate.js';

const router = express.Router();

// Any authenticated user can list departments
router.get('/', authMiddleware.protect, departmentControllers.listDepartments);

export default router;
