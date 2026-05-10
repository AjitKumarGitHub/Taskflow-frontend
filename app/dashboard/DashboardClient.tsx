"use client";

import { useEffect, useMemo, useState } from "react";
import type { Task } from "@/lib/task-types";
import { apiCreateTask, apiDeleteTask, apiGetTasks, apiUpdateTask } from "@/lib/api-client";
import { clearAuth, getAuth } from "@/lib/auth-storage";


import type { Role } from "@/lib/role-types";

type Toast = { kind: "success" | "error"; message: string } | null;

function statusLabel(status: Task["status"]) {
  switch (status) {
    case "todo":
      return "To do";
    case "in_progress":
      return "In progress";
    case "done":
      return "Done";
  }
}

function Select({ value, onChange }: { value: Task["status"]; onChange: (v: Task["status"]) => void }) {
  return (
    <select
      className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
      value={value}
      onChange={(e) => onChange(e.target.value as Task["status"])}
    >
      <option value="todo">To do</option>
      <option value="in_progress">In progress</option>
      <option value="done">Done</option>
    </select>
  );
}

export default function DashboardClient() {
 const [role, setRole] = useState<Role | null>(null);

  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const a = getAuth();
    if (!a) {
      window.location.href = "/login";
      return;
    }
    setRole(a.role);
    setToken(a.token);
  }, []);
  const [data, setData] = useState<Task[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  

   async function refresh() {
    try {
      if (!role || !token) return;
      const data = await apiGetTasks(role, token);
      setData(data);
      setTasks(data);
      console.log("Fetched tasks", data);
    } catch (e) {
      setToast({ kind: "error", message: e instanceof Error ? e.message : "Failed to load tasks" });
    }
  }

  useEffect(() => {
    refresh();
   console.log("refresh is called");
  }, []);

  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<Toast>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Task["status"]>("todo");

  // async function refresh() {
  //   try {
  //     if (!role || !token) return;
  //     const data = await apiGetTasks(role, token);
  //     setTasks(data);
  //   } catch (e) {
  //     setToast({ kind: "error", message: e instanceof Error ? e.message : "Failed to load tasks" });
  //   }
  // }

  useEffect(() => {
    if (!role || !token) return;
    refresh();
  }, [role, token]);


  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  function openCreate() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setStatus("todo");
    setFormOpen(true);
  }

  function openEdit(task: Task) {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description || "");
    setStatus(task.status);
    setFormOpen(true);
  }

  async function onSubmit(e: React.FormEvent) {
    if (!role || !token) return;

    e.preventDefault();
    if (!canSubmit) return;

    if (!role || !token) return;

    setLoading(true);

    setToast(null);
    try {
      if (!editingId) {
        const created = await apiCreateTask(role, token, { title, description: description || undefined, priority: "complete by EOD", status });
        setTasks((prev) => [created, ...prev]);
        setToast({ kind: "success", message: "Task created" });
        console.log("Created task", created);
         
      } else {
        const updated = await apiUpdateTask(role, token, editingId, { title, description: description || undefined, priority: "complete by EOD", status });
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setToast({ kind: "success", message: "Task updated" });
      }

      setFormOpen(false);
      setEditingId(null);
    } catch (err) {
      setToast({ kind: "error", message: err instanceof Error ? err.message : "Operation failed" });
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    const ok = window.confirm("Delete this task?");
    if (!ok) return;

    setLoading(true);
    setToast(null);
    try {
      if (!role || !token) return;
      await apiDeleteTask(role, token, id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setToast({ kind: "success", message: "Task deleted" });
    } catch (err) {
      setToast({ kind: "error", message: err instanceof Error ? err.message : "Failed to delete" });
    } finally {
      setLoading(false);
    }
  }

  async function onLogout() {
    setLoading(true);
    setToast(null);
    try {
      clearAuth();
      window.location.href = "/login";
    } catch (err) {
      setToast({ kind: "error", message: err instanceof Error ? err.message : "Logout failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-slate-600">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">TaskFlow</div>
            <div className="text-sm text-zinc-600">Tasks management</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={openCreate}
              className="rounded-md bg-zinc-900 text-white px-3 py-2 text-sm font-medium hover:bg-zinc-800 disabled:opacity-50"
              disabled={loading}
            >
              + New task
            </button>
            <button
              onClick={onLogout}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
              disabled={loading}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {toast ? (
          <div
            className={
              toast.kind === "success"
                ? "mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                : "mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            }
          >
            {toast.message}
          </div>
        ) : null}

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Your tasks</h2>
          <div className="text-sm text-zinc-600">{tasks.length} total</div>
        </div>


        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold text-zinc-500 bg-zinc-50">
            <div className="col-span-5">Title</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-2">Updated</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {tasks.length === 0 ? (
            <div className="px-4 py-8 text-sm text-zinc-600">No tasks yet.</div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {tasks.map((t) => (
                <div key={t.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center">
                  <div className="col-span-5">
                    <div className="font-medium text-zinc-900">{t.title}</div>
                    {t.description ? <div className="text-xs text-zinc-600 truncate">{t.description}</div> : null}
                  </div>
                  <div className="col-span-3">
                    <span className="text-sm text-zinc-800">{statusLabel(t.status)}</span>
                  </div>
                  <div className="col-span-2 text-sm text-zinc-600">{t.updatedAt ? new Date(t.updatedAt).toLocaleString() : ""}</div>
                  <div className="col-span-2 text-right flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(t)}
                      className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-zinc-50"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(t.id)}
                      className="rounded-md bg-red-600 text-white px-2.5 py-1.5 text-xs font-medium hover:bg-red-500 disabled:opacity-50"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {formOpen ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-xl border border-zinc-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{editingId ? "Edit task" : "Create task"}</h3>
                <p className="text-sm text-zinc-600">Create A New Task</p>
              </div>
              <button
                onClick={() => setFormOpen(false)}
                className="text-zinc-500 hover:text-zinc-700"
                disabled={loading}
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSubmit} className="mt-4 space-y-4">
              <label className="block">
                <div className="mb-1 text-sm font-medium text-zinc-700">Title</div>
                <input
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>

              <label className="block">
                <div className="mb-1 text-sm font-medium text-zinc-700">Description (optional)</div>
                <textarea
                  className="w-full min-h-[90px] resize-y rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              <div>
                <div className="mb-1 text-sm font-medium text-zinc-700">Status</div>
                <Select value={status} onChange={setStatus} />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="rounded-md bg-zinc-900 text-white px-3 py-2 text-sm font-medium disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

