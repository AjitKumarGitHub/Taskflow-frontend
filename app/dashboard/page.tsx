import { redirect } from "next/navigation";
import type { Task } from "@/lib/task-types";
import DashboardClient from "./DashboardClient";
import { getAuth } from "@/lib/auth-storage";
import { apiGetTasks } from "@/lib/api-client";


export default function DashboardPage() {
  // Client component handles auth + loading.
  return <DashboardClient />;
}




