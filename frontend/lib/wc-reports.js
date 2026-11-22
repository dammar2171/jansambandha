export const REPORTS = [
  { id: "complaints", title: "Complaint register", desc: "All complaints and their current status." },
  { id: "projects", title: "Ward projects", desc: "Project status, priority, and budget." },
  { id: "demand", title: "Citizen demand", desc: "Complaint demand grouped by category." },
];

export function buildReport(id, { demand, projects, complaints }) {
  if (id === "projects") {
    return {
      columns: ["Project", "Category", "Status", "Priority", "Budget"],
      rows: projects.map((project) => [
        project.title,
        project.category,
        project.status,
        `${project.priority}/100`,
        project.budget,
      ]),
    };
  }

  if (id === "demand") {
    return {
      columns: ["Category", "Complaints", "Suggestions"],
      rows: demand.map((item) => [item.label, item.count, item.suggestions]),
    };
  }

  return {
    columns: ["Tracking number", "Complaint", "Category", "Status", "Location"],
    rows: complaints.map((complaint) => [
      complaint.id,
      complaint.title,
      complaint.category,
      complaint.status,
      complaint.location,
    ]),
  };
}
