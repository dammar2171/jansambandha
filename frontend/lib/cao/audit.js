// Map a backend audit log into the CAO audit table row:
// [date-time, actor, action, record reference, details].

const ACTION_LABEL = {
  CREATE_USER: 'User created',
  UPDATE_USER_STATUS: 'User status changed',
  ADMIN_DECISION: 'Administrative decision',
  ADD_REVIEW: 'Proposal review added',
};

const fmtDateTime = (iso) => {
  if (!iso) return '\u2014';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '\u2014';
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const detailsOf = (log) => {
  const b = log.before || {};
  const a = log.after || {};
  if (b.accountStatus && a.accountStatus)
    return `${b.accountStatus} \u2192 ${a.accountStatus}`;
  if (a.accountStatus) return `Status: ${a.accountStatus}`;
  if (a.email) return `${a.email}${a.role ? ` \u00b7 ${a.role}` : ''}`;
  if (a.status && a.decision)
    return `${a.decision}${b.status ? ` \u00b7 ${b.status} \u2192 ${a.status}` : ''}`;
  if (a.decision) return `Decision: ${a.decision}`;
  if (a.note) return a.note;
  return '\u2014';
};

const recordRef = (log) => {
  const id = log.entityId ? String(log.entityId).slice(-6) : '';
  return `${log.entityType || 'Record'}${id ? ` \u00b7 ${id}` : ''}`;
};

export function mapAuditLog(log) {
  return [
    fmtDateTime(log.createdAt),
    log.actorUserId?.fullName ?? 'System',
    ACTION_LABEL[log.action] ?? log.action ?? 'Action',
    recordRef(log),
    detailsOf(log),
  ];
}
