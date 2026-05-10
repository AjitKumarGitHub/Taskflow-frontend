import { redirect } from "next/navigation";
import type { Task } from "@/lib/task-types";
import DashboardClient from "./DashboardClient";

export default function DashboardPage() {
  // Frontend-only auth (localStorage), so server can't see the token.
  // Client will redirect to /login if token is missing.
  const initialTasks: Task[] = [];
  return <DashboardClient initialTasks={initialTasks} />;
}



