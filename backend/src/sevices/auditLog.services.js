import AuditLog from '../models/AuditLog.js';
import { AppError } from '../utils/AppError.js';
import { ROLES, MONGODB_OBJECT_ID_REGEX } from '../constants/index.js';

const AUDIT_ROLES = [ROLES.CAO, ROLES.GENERAL_ADMIN];

const listAuditLogs = async (user, query) => {
  // 1. Only CAO and General Admin can view audit logs
  if (!AUDIT_ROLES.includes(user.role)) {
    throw new AppError('You are not allowed to view audit logs', 403);
  }

  // 2. Optional filters
  const filter = {};
  if (query.entityType) {
    filter.entityType = query.entityType;
  }
  if (query.action) {
    filter.action = query.action;
  }
  if (query.actorUserId) {
    if (!MONGODB_OBJECT_ID_REGEX.test(query.actorUserId)) {
      throw new AppError('Invalid actor user ID', 400);
    }
    filter.actorUserId = query.actorUserId;
  }

  // 3. Most recent first, capped to keep the response small
  return AuditLog.find(filter).sort({ createdAt: -1 }).limit(100);
};

export default { listAuditLogs };
