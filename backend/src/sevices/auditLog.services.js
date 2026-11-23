import AuditLog from '../models/AuditLog.js';
import { AppError } from '../utils/AppError.js';
import { ROLES } from '../constants/index.js';

// Roles allowed to read the municipal audit trail.
const AUDIT_VIEWER_ROLES = [ROLES.CAO, ROLES.GENERAL_ADMIN];

// Best-effort audit writer. Auditing must never break the action it records,
// so any failure here is swallowed rather than thrown to the caller.
const recordAudit = async ({
  actorUserId,
  action,
  entityType,
  entityId,
  before = null,
  after = null,
}) => {
  try {
    await AuditLog.create({
      actorUserId,
      action,
      entityType,
      entityId,
      before,
      after,
    });
  } catch {
    // Intentionally ignored: the primary action has already succeeded.
  }
};

// Read-only municipal audit trail for administrators, newest first.
const listAuditLogs = async (user, query = {}) => {
  if (!AUDIT_VIEWER_ROLES.includes(user.role)) {
    throw new AppError('You are not allowed to view audit logs', 403);
  }

  const filter = {};
  if (query.entityType) {
    filter.entityType = query.entityType;
  }

  const limit = Math.min(Math.max(Number(query.limit) || 100, 1), 500);

  return AuditLog.find(filter)
    .populate('actorUserId', 'fullName role')
    .sort({ createdAt: -1 })
    .limit(limit);
};

export default { recordAudit, listAuditLogs };
