import { NextResponse } from "next/server";
import { db, getUserByEmail, createUser } from "@/lib/dummy-store";

const AUTH_COOKIE_NAME = "taskflow_jwt";

function signDummyToken(payload: { userId: string; email: string }) {
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

  if (getUserByEmail(email)) {
    return NextResponse.json({ success: false, message: "Email already registered" }, { status: 409 });
  }

  const user = createUser(email);
  db.passwords.set(email, password);

  const token = signDummyToken({ userId: user.id, email: user.email });

  const res = NextResponse.json(
    {
      success: true,
      data: {
        token,
        user,
      },
    },
    { status: 201 }
  );

  res.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}

