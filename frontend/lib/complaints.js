const FLOW = ["Submitted", "Under review", "Assigned", "In progress", "Resolved"];
const isDone = (s) => s === "Resolved" || s === "Closed";
const quote = (t) => `\u201c${t}\u201d`;

export function homeSteps(c) {
  const idx = isDone(c.status) ? 4 : FLOW.indexOf(c.status === "Reopened" ? "Under review" : c.status);
  return FLOW.map((title, i) => {
    const ev = c.events.find((e) => e.status === title);
    let sub;
    if (ev) {
      if (title === "Submitted") sub = `${ev.date} \u00b7 by you`;
      else if (ev.note) sub = `${ev.role || ev.who} replied: ${quote(ev.note)}`;
      else sub = `${ev.who} \u00b7 ${ev.date}`;
    }
    const state = isDone(c.status) || i < idx ? "done" : i === idx ? "current" : "todo";
    return { title, sub, state };
  });
}

const DETAIL = ["Submitted", "Under review", "Assigned", "Resolved"];
const DETAIL_INDEX = { Submitted: 0, "Under review": 1, Reopened: 1, Assigned: 2, "In progress": 2, Resolved: 3, Closed: 3 };
const HINTS = { Assigned: "Waiting for the responsible office", Resolved: "You can rate the response after resolution" };

export function detailSteps(c) {
  const idx = DETAIL_INDEX[c.status] ?? 0;
  return DETAIL.map((title, i) => {
    const ev = [...c.events].reverse().find((e) => e.status === title || (title === "Assigned" && e.status === "In progress"));
    const state = isDone(c.status) || i < idx ? "done" : i === idx ? "current" : "todo";
    let sub;
    if (ev) {
      if (title === "Submitted") sub = `${ev.who} \u00b7 ${ev.date}${ev.time ? `, ${ev.time}` : ""}`;
      else sub = `${ev.who}${ev.role ? ` (${ev.role})` : ""} \u00b7 ${ev.date}${ev.note ? `: ${quote(ev.note)}` : ""}`;
    } else if (state === "todo" || state === "current") sub = HINTS[title];
    const label = title === "Assigned" && c.status === "In progress" ? "In progress" : title;
    return { title: label, sub, state };
  });
}
