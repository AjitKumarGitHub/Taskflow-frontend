import { NextResponse } from "next/server";
import { db, addTaskForUser, getTasksForUser } from "@/lib/dummy-store";
import type { Task } from "@/lib/task-types";
import { AUTH_COOKIE_NAME } from "@/lib/cookies";

function decodeDummyToken(token: string) {
  const raw = Buffer.from(token, "base64").toString("utf8");
  const [userId, email] = raw.split(":");
  return { userId, email };
}

function getAuth(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`));
  const token = match?.[1];
  if (!token) return undefined;
  try {
    return decodeDummyToken(token);
  } catch {
    return undefined;
  }
}

function requireAdmin(auth: { userId?: string; email?: string } | undefined) {
  if (!auth?.userId || !auth.email) return false;
  return auth.email.toLowerCase() === "admin@example.com";
}

export async function GET(req: Request) {
  const auth = getAuth(req);
  if (!requireAdmin(auth)) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const allTasks: Task[] = [];
  for (const user of db.users.values()) {
    allTasks.push(...getTasksForUser(user.id));
  }

  return NextResponse.json({ success: true, data: allTasks });
}

export async function POST(req: Request) {
  const auth = getAuth(req);
  if (!requireAdmin(auth)) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as { title: string; description?: string; status?: Task["status"]; userId?: string };
  const title = (body?.title || "").trim();
  const status = body?.status || "todo";
  const userId = body?.userId;

  if (!title) {
    return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
  }
  if (!userId || !db.tasks.has(userId)) {
    return NextResponse.json({ success: false, message: "Invalid userId" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const task: Task = {
    id: crypto.randomUUID(),
    title,
    description: body?.description?.trim() || undefined,
    status,
    createdAt: now,
    updatedAt: now,
    priority: (body as any)?.priority,
  };

  addTaskForUser(userId, task);
  return NextResponse.json({ success: true, data: task }, { status: 201 });
}

