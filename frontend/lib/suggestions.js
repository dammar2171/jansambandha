// Map a backend citizen suggestion (GET /suggestions) to the UI shape.

const STATUS_LABEL = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under review',
  PLANNED: 'Approved',
  DECLINED: 'Rejected',
};

export function mapSuggestion(s) {
  return {
    id: s.code || s._id,
    category: s.category,
    title: s.title,
    why: s.description,
    status: STATUS_LABEL[s.status] || 'Submitted',
  };
}
