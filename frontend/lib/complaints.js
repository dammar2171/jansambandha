const FLOW = [
  'Submitted',
  'Under review',
  'Assigned',
  'In progress',
  'Resolved',
];
const isDone = (s) => s === 'Resolved' || s === 'Closed';
const quote = (t) => `\u201c${t}\u201d`;

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const STATUS_MAP = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under review',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const fmtDate = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

// Maps a backend complaint document to the shape the citizen UI expects.
export function mapComplaint(c) {
  const status = STATUS_MAP[c.status] || 'Submitted';
  const date = fmtDate(c.createdAt);
  const events = [
    { status: 'Submitted', who: 'You', date, time: fmtTime(c.createdAt) },
  ];
  for (const r of c.responses || []) {
    events.push({
      status: status === 'Submitted' ? 'Under review' : status,
      who: 'Official',
      role: 'Ward office',
      date: fmtDate(r.createdAt),
      note: r.message,
    });
  }
  return {
    id: c.trackingCode || c._id,
    _id: c._id,
    category: c.category,
    title: c.title,
    description: c.description,
    location: c.location,
    status,
    date,
    projectId: null,
    events,
  };
}

export function homeSteps(c) {
  const idx = isDone(c.status)
    ? 4
    : FLOW.indexOf(c.status === 'Reopened' ? 'Under review' : c.status);
  return FLOW.map((title, i) => {
    const ev = c.events.find((e) => e.status === title);
    let sub;
    if (ev) {
      if (title === 'Submitted') sub = `${ev.date} \u00b7 by you`;
      else if (ev.note) sub = `${ev.role || ev.who} replied: ${quote(ev.note)}`;
      else sub = `${ev.who} \u00b7 ${ev.date}`;
    }
    const state =
      isDone(c.status) || i < idx ? 'done' : i === idx ? 'current' : 'todo';
    return { title, sub, state };
  });
}

const DETAIL = ['Submitted', 'Under review', 'Assigned', 'Resolved'];
const DETAIL_INDEX = {
  Submitted: 0,
  'Under review': 1,
  Reopened: 1,
  Assigned: 2,
  'In progress': 2,
  Resolved: 3,
  Closed: 3,
};
const HINTS = {
  Assigned: 'Waiting for the responsible office',
  Resolved: 'You can rate the response after resolution',
};

export function detailSteps(c) {
  const idx = DETAIL_INDEX[c.status] ?? 0;
  return DETAIL.map((title, i) => {
    const ev = [...c.events]
      .reverse()
      .find(
        (e) =>
          e.status === title ||
          (title === 'Assigned' && e.status === 'In progress'),
      );
    const state =
      isDone(c.status) || i < idx ? 'done' : i === idx ? 'current' : 'todo';
    let sub;
    if (ev) {
      if (title === 'Submitted')
        sub = `${ev.who} \u00b7 ${ev.date}${ev.time ? `, ${ev.time}` : ''}`;
      else
        sub = `${ev.who}${ev.role ? ` (${ev.role})` : ''} \u00b7 ${ev.date}${ev.note ? `: ${quote(ev.note)}` : ''}`;
    } else if (state === 'todo' || state === 'current') sub = HINTS[title];
    const label =
      title === 'Assigned' && c.status === 'In progress'
        ? 'In progress'
        : title;
    return { title: label, sub, state };
  });
}
