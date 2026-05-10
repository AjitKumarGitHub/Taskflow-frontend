import type { Role } from "./role-types";

type StoredAuth = {
  token: string;
  role: Role;
  name: string;
  email: string;
};

const KEY = "taskflow_auth";

export function setAuth(data: StoredAuth) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getAuth(): StoredAuth | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

