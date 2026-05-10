import { NextResponse } from "next/server";
import { db } from "@/lib/dummy-store";
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

export async function GET(req: Request) {
  const auth = getAuth(req);
  if (!auth?.userId || !auth.email) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  // Dummy auth: treat admin by email prefix or known admin list.
  // For now, allow access only if requesting user's email is exactly 'admin@example.com'.
  // If your backend sets roles differently, replace this guard.
  const isAdmin = auth.email.toLowerCase() === "admin@example.com";
  if (!isAdmin) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const users = Array.from(db.users.values()).map((u) => ({
    id: u.id,
    email: u.email,
  }));

  return NextResponse.json({ success: true, data: users });
}

