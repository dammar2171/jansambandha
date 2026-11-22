// Map a backend project (from GET /projects) into the shape the citizen UI
// expects. Fields the backend does not track yet get safe placeholders so the
// list and detail pages render without errors.

const STATUS_LABEL = {
  APPROVED: 'Approved',
  ASSIGNED: 'Assigned',
  ONGOING: 'Ongoing',
  DELAYED: 'Delayed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const rs = (n) =>
  typeof n === 'number' ? `Rs ${new Intl.NumberFormat('en-IN').format(n)}` : '—';

export function mapProject(p) {
  const verified = p.verifiedProgress ?? 0;
  const dept = p.departmentId?.name ?? 'Department';
  const place =
    p.wardId?.wardNumber != null
      ? `Ward ${p.wardId.wardNumber}`
      : (p.wardId?.name ?? '\u2014');
  const budget = rs(p.approvedBudget);

  return {
    id: p._id,
    title: p.title,
    category: dept,
    place,
    priority: null, // priority scoring lives on proposals, not projects
    status: STATUS_LABEL[p.status] ?? 'Approved',
    fy: p.fiscalYear ? `FY ${p.fiscalYear}` : '\u2014',
    dept,
    planned: 0,
    verified,
    financial: 0,
    barNote: 'Department-verified progress',
    cardBudget: budget,
    metrics: {
      planned: { value: '\u2014', note: 'Not reported yet' },
      verified: { value: `${verified}%`, note: 'Verified on site' },
      financial: { value: '\u2014', note: 'Not reported yet' },
      satisfaction: { value: '\u2014', note: 'No ratings yet' },
    },
    quality: null,
    budget: {
      estimated: '\u2014',
      approved: budget,
      contracted: '\u2014',
      spent: '\u2014',
    },
    up: p.reactions?.up ?? 0,
    down: p.reactions?.down ?? 0,
    commentCount: p.commentCount ?? 0,
    journey: [],
  };
}
