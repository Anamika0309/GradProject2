import { redirect } from "next/navigation";
// /runs (no ID) → redirect to the runs list page
export default function RunsListPage() {
  redirect("/repository");
}
