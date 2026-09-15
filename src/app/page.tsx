import { DashboardView } from "@/components/dashboard-view";
import {
  getAllEntries,
  getTopFiveForMonth,
  getTopFiveMonthSummaries,
  pickDefaultTopFiveMonth,
} from "@/lib/queries";
import { isEditor } from "@/lib/auth";
import { normalizePeriodDate } from "@/lib/metrics";

export default async function DashboardPage() {
  const currentMonth = normalizePeriodDate(new Date().toISOString(), "MONTHLY");

  const [entries, editor, topFiveMonthSummaries] = await Promise.all([
    getAllEntries(),
    isEditor(),
    getTopFiveMonthSummaries(),
  ]);

  const topFiveMonth = pickDefaultTopFiveMonth(topFiveMonthSummaries, currentMonth);
  const topFiveEntries = await getTopFiveForMonth(topFiveMonth);

  return (
    <DashboardView
      entries={entries}
      isEditor={editor}
      topFiveMonth={topFiveMonth}
      currentMonth={currentMonth}
      topFiveEntries={topFiveEntries}
      topFiveMonths={topFiveMonthSummaries.map((summary) => summary.periodDate)}
    />
  );
}
