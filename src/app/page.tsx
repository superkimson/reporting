import { DashboardView } from "@/components/dashboard-view";
import { getAllEntries } from "@/lib/queries";

export default async function DashboardPage() {
  const entries = await getAllEntries();
  return <DashboardView entries={entries} />;
}
