import type { ApiResponse, Task } from "./task-types";
import type { Role } from "./role-types";

const API_BASE = "https://taskflow-backend-jhnq.onrender.com/api/v1";

function buildHeaders(token: string | null) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as Record<string, string>;
}

async function parseJson<T>(res: Response): Promise<ApiResponse<T>> {
  const text = await res.text();
  try {
    return text
      ? (JSON.parse(text) as ApiResponse<T>)
      : { success: false, message: "Empty response" };
  } catch {
    return { success: false, message: text || res.statusText };
  }
}

export type RegisterBody = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type AuthUser = {
  token: string;
  email: string;
  role: Role;
  name: string;
};

export function normalizeRole(role: string): Role {
  return role === "ADMIN" || role === "admin" ? "admin" : "user";
}


export async function apiLogin(payload: LoginBody) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: buildHeaders(null),
    body: JSON.stringify(payload),
  });

  const json = await parseJson<AuthUser>(res);
  if (!res.ok) throw new Error(json.message || "Login failed");
  return json;
}

export async function apiRegister(payload: RegisterBody) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: buildHeaders(null),
    body: JSON.stringify(payload),
  });

  const json = await parseJson<AuthUser>(res);
  if (!res.ok) throw new Error(json.message || "Registration failed");
  return json;
}

function userTasksPath(role: Role) {
  return role === "admin" ? `${API_BASE}/admin/tasks` : `${API_BASE}/tasks`;
}

export async function apiGetTasks(role: Role, token: string) {
  const res = await fetch(userTasksPath(role), {
    method: "GET",
    headers: buildHeaders(token),
  });

  const json = await parseJson<Task[]>(res);
  if (!res.ok) throw new Error(json.message || "Failed to load tasks");
  return json.data || [];
}

export async function apiCreateTask(role: Role, token: string, payload: { title: string; description?: string; priority: string; status: string }) {
  const res = await fetch(userTasksPath(role), {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });

  const json = await parseJson<Task>(res);
  if (!res.ok) throw new Error(json.message || "Failed to create task");
  return json.data as Task;
}

export async function apiUpdateTask(
  role: Role,
  token: string,
  id: string,
  payload: { title: string; description?: string; priority: string; status: string }
) {
  const base = userTasksPath(role);
  const res = await fetch(`${base}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });

  const json = await parseJson<Task>(res);
  if (!res.ok) throw new Error(json.message || "Failed to update task");
  return json.data as Task;
}

export async function apiDeleteTask(role: Role, token: string, id: string) {
  const base = userTasksPath(role);
  const res = await fetch(`${base}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: buildHeaders(token),
  });

  const json = await parseJson<void>(res);
  if (!res.ok) throw new Error(json.message || "Failed to delete task");
  return json;
}

export async function apiGetAllUsersByAdmin(token: string) {
  const res = await fetch(`${API_BASE}/admin/users`, {
    method: "GET",
    headers: buildHeaders(token),
  });

  const json = await parseJson<{ id: string; email: string; role?: string; name?: string }[]>(res);
  if (!res.ok) throw new Error(json.message || "Failed to load users");
  return json.data || [];
}

export async function apiDeleteUserByAdmin(token: string, userId: string) {
  const res = await fetch(`${API_BASE}/admin/userdelete/${encodeURIComponent(userId)}` , {
    method: "DELETE",
    headers: buildHeaders(token),
  });

  const json = await parseJson<void>(res);
  if (!res.ok) throw new Error(json.message || "Failed to delete user");
  return json;
}



