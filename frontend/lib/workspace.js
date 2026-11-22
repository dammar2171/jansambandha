// Map a backend project (from GET /projects, enriched with ward, department,
// contractor, reported/verified progress) into the shape the department /
// contractor / general-admin RoleWorkspace expects.

const STATUS_LABEL = {
  APPROVED: 'Approved',
  ASSIGNED: 'Assigned',
  ONGOING: 'Ongoing',
  DELAYED: 'Delayed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const wardName = (w) => {
  if (w && typeof w === 'object') {
    return w.wardNumber != null ? `Ward ${w.wardNumber}` : (w.name ?? '\u2014');
  }
  return '\u2014';
};

const fmtDate = (iso) => {
  if (!iso) return '\u2014';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '\u2014' : d.toISOString().slice(0, 10);
};

export function mapWorkspaceProject(p) {
  return {
    id: p._id,
    name: p.title,
    ward: wardName(p.wardId),
    dept: p.departmentId?.name ?? '\u2014',
    contractor: p.contractorId?.fullName ?? 'Unassigned',
    budget: p.approvedBudget ?? 0,
    spent: 0,
    reported: p.reportedProgress ?? 0,
    verified: p.verifiedProgress ?? 0,
    status: STATUS_LABEL[p.status] ?? 'Approved',
    stage: '\u2014',
    due: fmtDate(p.endDate),
    priority: 0,
    comments: p.commentCount ?? 0,
  };
}
