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

const UPDATE_STATUS_LABEL = {
  SUBMITTED: 'Submitted',
  NEEDS_CORRECTION: 'Needs correction',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
};

// Map a backend progress update (ProjectUpdate) into the three-column row the
// contractor "Progress submission history" panel renders: [ref, detail, status].
export function mapSubmissionRow(u, project) {
  const date = fmtDate(u.createdAt);
  const name = project?.name ?? 'Project';
  const stage = (u.workDescription ?? '').trim();
  const shortStage = stage.length > 60 ? `${stage.slice(0, 57)}\u2026` : stage;
  const detail = `${name} \u00b7 ${u.reportedProgress ?? 0}%${
    shortStage ? ` \u00b7 ${shortStage}` : ''
  }`;
  return [
    `SUB \u00b7 ${date}`,
    detail,
    UPDATE_STATUS_LABEL[u.status] ?? 'Submitted',
  ];
}

const QUALITY_LABEL = {
  PASS: 'Satisfactory',
  NEEDS_IMPROVEMENT: 'Needs improvement',
  FAIL: 'Non-compliant',
  NOT_ASSESSED: 'Not assessed',
};

// Map a backend progress-comparison row (a contractor update joined with its
// department inspection) into the record the inspection register table renders.
export function mapInspectionRecord(r, project) {
  const reported = r.reportedProgress ?? 0;
  const verified = r.verifiedProgress ?? 0;
  return {
    id: `INS-${String(r.updateId).slice(-6)}`,
    project: project?.name ?? 'Project',
    pid: project?.id ?? '',
    reported,
    verified,
    gap: r.difference ?? reported - verified,
    quality: QUALITY_LABEL[r.qualityStatus] ?? 'Not assessed',
    date: fmtDate(r.periodTo),
    observation: '',
  };
}

const PROPOSAL_STATUS_LABEL = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under review',
  RETURNED: 'Returned',
  REJECTED: 'Rejected',
  ASSEMBLY_APPROVED: 'Assembly approved',
  ADMIN_APPROVED: 'Administratively approved',
};

// Map a backend project proposal into the row the general-admin review list shows.
export function mapReviewProposal(p) {
  return {
    id: p._id,
    title: p.title ?? 'Proposal',
    ward: wardName(p.wardId),
    budget: p.estimatedBudget ?? 0,
    status: PROPOSAL_STATUS_LABEL[p.status] ?? 'Draft',
  };
}

const APPROVAL_ACTION_LABEL = {
  TECHNICAL_REVIEW: 'Technical review',
  ADMIN_REVIEW: 'Administrative review',
  ASSEMBLY_DECISION: 'Assembly decision',
  ADMIN_APPROVAL: 'Administratively approved',
  RETURN: 'Returned for correction',
  REJECTION: 'Rejected',
};

// Map a backend approval/review record into a review-history entry.
export function mapReviewEvent(a) {
  return {
    id: a._id,
    label: APPROVAL_ACTION_LABEL[a.action] ?? a.action ?? 'Review',
    when: fmtDate(a.decisionDate || a.createdAt),
    remarks: a.remarks || '',
  };
}
