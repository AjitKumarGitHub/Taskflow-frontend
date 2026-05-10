import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/dummy-store";
import type { Task } from "@/lib/task-types";
import { AUTH_COOKIE_NAME } from "@/lib/cookies";

function decodeDummyToken(token: string) {
  const raw = Buffer.from(token, "base64").toString("utf8");
  const [userId, email] = raw.split(":");
  return { userId, email };
}

function getAuth(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(
    new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`)
  );

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

// Next.js 16 route type validator sometimes expects params as Promise<{id:string}> internally.
// Using a loose context type avoids build-time typecheck mismatch while preserving runtime behavior.
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const auth = getAuth(req);

  if (!requireAdmin(auth)) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 }
    );
  }

  const taskId = "id" in (context.params as any) ? (context.params as any).id : undefined;


  let deleted = false;


  for (const [userId, tasks] of db.tasks.entries()) {
    const filtered = tasks.filter((t: Task) => t.id !== taskId);

    if (filtered.length !== tasks.length) {
      deleted = true;
      db.tasks.set(userId, filtered);
    }
  }

  if (!deleted) {
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Deleted",
  });
}