"use client";
import { useState } from "react";
import ProjectCard from "./ProjectCard";
import { useStore } from "@/lib/store";

const FILTERS = [
  ["All", null],
  ["Ongoing", "Ongoing"],
  ["Approved", "Approved"],
  ["Proposed", "Under review"],
];

export default function ProjectList({ title = "Projects in your ward" }) {
  const projects = useStore((s) => s.projects);
  const search = useStore((s) => s.search).trim().toLowerCase();
  const [filter, setFilter] = useState("All");
  const status = FILTERS.find(([l]) => l === filter)[1];
  const list = projects.filter(
    (p) => (!status || p.status === status) && (!search || `${p.title} ${p.category} ${p.place}`.toLowerCase().includes(search)),
  );

  return (
    <section aria-labelledby="plist" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 id="plist" className="text-[17px] font-semibold leading-[22px] text-ink">{title}</h2>
        <div className="flex gap-2" role="group" aria-label="Filter by stage">
          {FILTERS.map(([label]) => {
            const on = label === filter;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(label)}
                className={`rounded-full px-[15px] py-[5px] text-[13px] font-medium leading-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  on ? "bg-brand text-white" : "border border-line-strong bg-surface text-ink-2 hover:bg-surface-alt"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {list.length ? (
        list.map((p) => <ProjectCard key={p.id} project={p} />)
      ) : (
        <div className="rounded-xl border border-dashed border-line-strong bg-surface p-10 text-center text-sm text-ink-3">
          No projects match{search ? ` \u201c${search}\u201d` : " this filter"}. Try another filter or clear the search.
        </div>
      )}
      <p className="text-xs leading-[15px] text-ink-3">Likes and dislikes are community feedback only. They do not approve or reject a project.</p>
    </section>
  );
}
