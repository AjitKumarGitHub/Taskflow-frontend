 import { NextRequest, NextResponse } from "next/server";
import { db, getTasksForUser } from "@/lib/dummy-store";
import type { Task } from "@/lib/task-types";

const AUTH_COOKIE_NAME = "taskflow_jwt";

function decodeDummyToken(token: string) {
  const raw = Buffer.from(token, "base64").toString("utf8");
  const [userId, email] = raw.split(":");
  return { userId, email };
}

function getAuth(req: NextRequest) {
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

// ========================
// GET TASK
// ========================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuth(req);

  if (!auth?.userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;

  const tasks = getTasksForUser(auth.userId);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: task });
}

// ========================
// UPDATE TASK
// ========================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuth(req);

  if (!auth?.userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;

  const tasks = getTasksForUser(auth.userId);
  const idx = tasks.findIndex((t) => t.id === id);

  if (idx < 0) {
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404 }
    );
  }

  const body = (await req.json()) as {
    title: string;
    description?: string;
    status: Task["status"];
  };

  const title = body?.title?.trim();

  if (!title) {
    return NextResponse.json(
      { success: false, message: "Title is required" },
      { status: 400 }
    );
  }

  const updated: Task = {
    ...tasks[idx],
    title,
    description: body?.description?.trim() || undefined,
    status: body?.status || tasks[idx].status,
    updatedAt: new Date().toISOString(),
  };

  tasks[idx] = updated;
  db.tasks.set(auth.userId, tasks);

  return NextResponse.json({ success: true, data: updated });
}

// ========================
// DELETE TASK
// ========================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuth(req);

  if (!auth?.userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;

  const tasks = getTasksForUser(auth.userId);

  const filtered = tasks.filter((t) => t.id !== id);

  if (filtered.length === tasks.length) {
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404 }
    );
  }

  db.tasks.set(auth.userId, filtered);

  return NextResponse.json({
    success: true,
    message: "Deleted",
  });
}