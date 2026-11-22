// Map backend project proposals and approval records into the shapes the
// CAO approvals screens expect. Fields the backend does not track yet
// (priority score, assembly decision, affected population) get placeholders.

const STATUS_LABEL = {
  DRAFT: 'Draft',
  SUBMITTED: 'Awaiting CAO',
  UNDER_REVIEW: 'Awaiting CAO',
  RETURNED: 'Returned',
  REJECTED: 'Rejected',
  ASSEMBLY_APPROVED: 'Approved',
  ADMIN_APPROVED: 'Approved',
};

const ACTION_LABEL = {
  TECHNICAL_REVIEW: 'Technical review',
  ADMIN_REVIEW: 'Administrative review',
  ASSEMBLY_DECISION: 'Assembly decision',
  ADMIN_APPROVAL: 'Administratively approved',
  RETURN: 'Returned for correction',
  REJECTION: 'Rejected',
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

export function mapCaoProposal(p) {
  return {
    id: p._id,
    title: p.title,
    ward: wardName(p.wardId),
    category: p.category ?? '\u2014',
    budget: p.estimatedBudget ?? 0,
    score: 0,
    status: STATUS_LABEL[p.status] ?? 'Draft',
    submitted: fmtDate(p.submittedAt || p.createdAt),
    demand: 0,
    affected: 0,
    assembly: '\u2014',
    meeting: '\u2014',
    conditions: '\u2014',
    department: '\u2014',
    review: p.description || '\u2014',
    reviewer: '\u2014',
    priority: '\u2014',
    justification: p.justification || '',
  };
}

export function mapApproval(a) {
  return {
    id: a._id,
    label: ACTION_LABEL[a.action] ?? a.action,
    when: fmtDate(a.decisionDate || a.createdAt),
    remarks: a.remarks || '',
  };
}
