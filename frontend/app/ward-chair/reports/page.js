"use client";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import WcTopBar from "@/components/layout/WcTopBar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { downloadCsv } from "@/lib/csv";
import { REPORTS, buildReport } from "@/lib/wc-reports";
import { showToast, useWc } from "@/lib/wc-store";

export default function WardReportsPage() {
  const demand = useWc((s) => s.demand);
  const projects = useWc((s) => s.projects);
  const complaints = useWc((s) => s.complaints);
  const [id, setId] = useState(REPORTS[0].id);

  const meta = REPORTS.find((r) => r.id === id);
  const { columns, rows } = buildReport(id, { demand, projects, complaints });

  return (
    <>
      <WcTopBar crumbs={[{ label: "Reports" }]} />
      <main className="flex flex-col gap-6 p-8">
        <div>
          <h1 className="text-[26px] font-bold leading-[31px] text-ink">Reports</h1>
          <p className="mt-1 text-sm leading-[17px] text-ink-3">Ward 4 reports for the annual plan. Choose a report, check the preview, then download it.</p>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <Card className="p-2" as="div">
            <ul role="radiogroup" aria-label="Report type" className="flex flex-col gap-1">
              {REPORTS.map((r) => {
                const on = r.id === id;
                return (
                  <li key={r.id}>
                    <button type="button" role="radio" aria-checked={on} onClick={() => setId(r.id)} className={`w-full rounded-lg px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-brand ${on ? "bg-brand-tint ring-1 ring-inset ring-brand" : "hover:bg-surface-alt"}`}>
                      <span className={`block text-sm font-semibold leading-[18px] ${on ? "text-brand" : "text-ink"}`}>{r.title}</span>
                      <span className="block text-xs leading-4 text-ink-3">{r.desc}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[17px] font-semibold leading-[22px] text-ink">{meta.title}</h2>
                <p className="text-xs leading-4 text-ink-3">Ward 4, Kailali Municipality · Fiscal year 2083/84 · {rows.length} {rows.length === 1 ? "row" : "rows"}</p>
              </div>
              <div className="flex gap-2 print:hidden">
                <Button variant="secondary" size="sm" onClick={() => window.print()}>Print</Button>
                <Button size="sm" onClick={() => { downloadCsv(`ward-4-${id}.csv`, columns, rows); showToast("Report downloaded as CSV"); }}>
                  <Icon name="dl" size={15} />
                  Download CSV
                </Button>
              </div>
            </div>
            {rows.length ? (
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-surface-alt text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                    <tr>{columns.map((c) => <th key={c} scope="col" className="px-3 py-2.5">{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-t border-line">
                        {r.map((cell, j) => <td key={j} className={`px-3 py-3 ${j === 0 ? "font-medium text-ink" : "text-ink-2"}`}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="rounded-lg border border-dashed border-line-strong p-8 text-center text-sm text-ink-3">Nothing to report. Every complaint is resolved.</p>}
            <p className="mt-3 text-xs leading-4 text-ink-3">Numbers come from complaints and project records in the system. Likes and dislikes are community opinion only.</p>
          </Card>
        </div>
      </main>
    </>
  );
}
