import { NextResponse } from "next/server";
import { db, addTaskForUser, getTasksForUser } from "@/lib/dummy-store";
import type { Task } from "@/lib/task-types";

const AUTH_COOKIE_NAME = "taskflow_jwt";

function decodeDummyToken(token: string) {
  // base64(userId:email)
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

export async function GET(req: Request) {
  const auth = getAuth(req);
  if (!auth?.userId) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const tasks = getTasksForUser(auth.userId);
  return NextResponse.json({ success: true, data: tasks });
}

export async function POST(req: Request) {
  const auth = getAuth(req);
  if (!auth?.userId) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { title: string; description?: string; status: Task["status"] };
  const title = (body?.title || "").trim();
  const status = body?.status;

  if (!title) {
    return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const task: Task = {
    id: crypto.randomUUID(),
    title,
    description: body?.description?.trim() || undefined,
    status: status || "todo",
    createdAt: now,
    updatedAt: now,
  };

  addTaskForUser(auth.userId, task);
  return NextResponse.json({ success: true, data: task }, { status: 201 });
}

