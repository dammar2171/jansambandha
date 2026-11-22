import Link from "next/link";
import Card from "@/components/ui/Card";

export default function DemandCard({ demand }) {
  const total = demand.reduce((sum, item) => sum + item.count, 0);
  const topItems = [...demand].sort((a, b) => b.count - a.count).slice(0, 4);

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold leading-[21px] text-ink">Citizen demand</h2>
          <p className="text-xs text-ink-3">{total} complaints across {demand.length} categories</p>
        </div>
        <Link href="/ward-chair/demands" className="text-[13px] font-medium text-brand hover:underline">
          View all
        </Link>
      </div>
      <ul className="flex flex-col gap-3">
        {topItems.map((item) => (
          <li key={item.label} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="font-medium text-ink">{item.label}</span>
            <span className="text-ink-3">{item.count} complaints</span>
          </li>
        ))}
        {!topItems.length && <li className="text-[13px] text-ink-3">No complaint demand has been recorded yet.</li>}
      </ul>
    </Card>
  );
}
