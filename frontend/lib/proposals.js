// Map a backend project proposal into the shape the ward-chair UI expects.
// Fields the proposal model does not track (priority, progress, feedback)
// get safe placeholders so the list, detail, and edit pages render cleanly.

const STATUS_LABEL = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under review',
  RETURNED: 'Returned',
  REJECTED: 'Rejected',
  ASSEMBLY_APPROVED: 'Approved',
  ADMIN_APPROVED: 'Approved',
};

const STATUS_NOTE = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted for CAO review',
  UNDER_REVIEW: 'Under review',
  RETURNED: 'Returned for revision',
  REJECTED: 'Rejected',
  ASSEMBLY_APPROVED: 'Approved',
  ADMIN_APPROVED: 'Approved',
};

export function mapProposal(p) {
  return {
    id: p._id,
    title: p.title,
    category: p.category,
    place: p.location ?? '',
    budget: p.estimatedBudget ?? 0,
    households: 0,
    justification: p.justification ?? '',
    benefits: p.description ?? '',
    fy: p.fiscalYear ?? '2083/84',
    status: STATUS_LABEL[p.status] ?? 'Draft',
    statusNote: STATUS_NOTE[p.status] ?? '',
    priority: 0,
    up: 0,
    down: 0,
    comments: 0,
    satisfaction: 0,
    progress: null,
    docs: [],
    history: [],
    breakdown: [],
    returnReason: '',
  };
}
