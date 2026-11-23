import express from 'express';
import auditLogControllers from '../controllers/auditLog.controllers.js';
import authMiddleware from '../middlewares/authenticate.js';

const router = express.Router();

// CAO / General Admin: read-only municipal audit trail
router.get('/', authMiddleware.protect, auditLogControllers.listAuditLogs);

export default router;
