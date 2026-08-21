import { DashboardView } from "@/components/dashboard-view";
import { getAllEntries } from "@/lib/queries";
import { isEditor } from "@/lib/auth";

export default async function DashboardPage() {
  const [entries, editor] = await Promise.all([getAllEntries(), isEditor()]);
  return <DashboardView entries={entries} isEditor={editor} />;
}
