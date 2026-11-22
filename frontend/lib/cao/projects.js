// Map a backend project (from GET /projects, already enriched with ward,
// department and verified progress) into the shape the CAO project screens
// expect. Fields the backend does not surface here get safe placeholders.

const STATUS_LABEL = {
  APPROVED: 'Planning',
  ASSIGNED: 'Planning',
  ONGOING: 'Ongoing',
  DELAYED: 'Delayed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const fmtDate = (iso) => {
  if (!iso) return '\u2014';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '\u2014';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const wardName = (w) => {
  if (w && typeof w === 'object') {
    return w.wardNumber != null ? `Ward ${w.wardNumber}` : (w.name ?? '\u2014');
  }
  return '\u2014';
};

export function mapCaoProject(p) {
  const verified = p.verifiedProgress ?? 0;
  const budget = p.approvedBudget ?? 0;
  return {
    id: p._id,
    title: p.title,
    ward: wardName(p.wardId),
    department: p.departmentId?.name ?? '\u2014',
    contractor: p.contractorId ? 'Assigned' : 'Unassigned',
    status: STATUS_LABEL[p.status] ?? 'Planning',
    budget,
    approved: budget,
    contracted: 0,
    spent: 0,
    // No separate contractor-reported figure in the list payload yet.
    reported: verified,
    verified,
    quality: 'Not inspected',
    due: fmtDate(p.endDate),
  };
}
