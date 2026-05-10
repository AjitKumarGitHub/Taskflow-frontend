import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "taskflow_jwt";

export async function getAuthTokenFromCookies(): Promise<string | undefined> {
  const store = await cookies();
  const cookie = store.get(AUTH_COOKIE_NAME);
  return cookie?.value ?? undefined;
}




