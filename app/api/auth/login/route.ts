import { NextResponse } from "next/server";
import { db, getUserByEmail, createUser } from "@/lib/dummy-store";

const AUTH_COOKIE_NAME = "taskflow_jwt";

function signDummyToken(payload: { userId: string; email: string }) {
  // Dummy token format: base64(userId:email)
  const raw = `${payload.userId}:${payload.email}`;
  return Buffer.from(raw).toString("base64");
}

export async function POST(req: Request) {
  const body = (await req.json()) as { email: string; password: string };
  const email = (body?.email || "").toLowerCase();
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
  }

  const user = getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
  }

  const savedPassword = db.passwords.get(email);
  if (savedPassword !== password) {
    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
  }

  const token = signDummyToken({ userId: user.id, email: user.email });

  const res = NextResponse.json(
    {
      success: true,
      data: {
        token,
        user,
      },
    },
    { status: 200 }
  );

  res.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}

