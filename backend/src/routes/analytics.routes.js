import express from 'express';
import analyticsControllers from '../controllers/analytics.controllers.js';
import authMiddleware from '../middlewares/authenticate.js';

const router = express.Router();

// CAO / General Admin (enforced in the service)
router.get(
  '/municipality',
  authMiddleware.protect,
  analyticsControllers.municipality,
);

router.get('/wards', authMiddleware.protect, analyticsControllers.wards);

export default router;
