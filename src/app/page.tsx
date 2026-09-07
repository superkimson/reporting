import { DashboardView } from "@/components/dashboard-view";
import { getAllEntries, getTopFiveForMonth, getTopFiveMonths } from "@/lib/queries";
import { isEditor } from "@/lib/auth";
import { normalizePeriodDate } from "@/lib/metrics";

export default async function DashboardPage() {
  const currentMonth = normalizePeriodDate(new Date().toISOString(), "MONTHLY");

  const [entries, editor, topFiveEntries, topFiveMonths] = await Promise.all([
    getAllEntries(),
    isEditor(),
    getTopFiveForMonth(currentMonth),
    getTopFiveMonths(),
  ]);

  return (
    <DashboardView
      entries={entries}
      isEditor={editor}
      topFiveMonth={currentMonth}
      topFiveEntries={topFiveEntries}
      topFiveMonths={topFiveMonths}
    />
  );
}
