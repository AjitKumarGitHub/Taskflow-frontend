import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/cookies";
import { db } from "@/lib/dummy-store";

function decodeDummyToken(token: string) {
  const raw = Buffer.from(token, "base64").toString("utf8");
  const [userId, email] = raw.split(":");
  return { userId, email };
}

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`));
  const token = match?.[1];
  if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  let decoded: { userId?: string; email?: string } = {};
  try {
    decoded = decodeDummyToken(token);
  } catch {
    return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
  }

  const user = decoded.email ? db.users.get(decoded.email.toLowerCase()) : undefined;
  if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    success: true,
    data: { token, user },
  });
}


