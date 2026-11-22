import express from 'express';
import dashboardControllers from '../controllers/dashboard.controllers.js';
import authMiddleware from '../middlewares/authenticate.js';

const {
  protect,
  isCitizen,
  isWard,
  isDepartment,
  isGeneralAdmin,
  isCao,
  isContractor,
} = authMiddleware;

const router = express.Router();

router.get('/citizen', protect, isCitizen, dashboardControllers.citizen);
router.get('/ward', protect, isWard, dashboardControllers.ward);
router.get('/department', protect, isDepartment, dashboardControllers.department);
router.get('/admin', protect, isGeneralAdmin, dashboardControllers.admin);
router.get('/cao', protect, isCao, dashboardControllers.cao);
router.get('/contractor', protect, isContractor, dashboardControllers.contractor);

export default router;
