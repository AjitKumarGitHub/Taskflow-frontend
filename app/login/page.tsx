"use client";

import { useMemo, useState } from "react";
import { apiLogin, normalizeRole } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { setAuth } from "@/lib/auth-storage";


function Field({ label, type = "text", value, onChange }: { label: string; type?: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-zinc-700">{label}</div>
      <input
        className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </label>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => email.trim().length > 0 && password.length > 0, [email, password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      const json = await apiLogin({ email, password });
      const data = json.data;
      if (!data?.token || !data?.role) throw new Error("Invalid login response");

      setAuth({
        token: data.token,
        role: normalizeRole(data.role as string),
        name: data.name,
        email: data.email,
      });

      if (normalizeRole(data.role as string) === "admin") {
        router.push("/admin-dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-zinc-200 p-6">
        <h1 className="text-2xl font-semibold text-red-600">Login</h1>
        <p className="text-sm text-zinc-600 mt-1">Use your account to access the dashboard.</p>

        {error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-5 space-y-4 text-slate-500">
          <Field label="Email" value={email} onChange={setEmail} type="email" />
          <Field label="Password" value={password} onChange={setPassword} type="password" />

          <button
            disabled={!canSubmit || loading}
            className="w-full rounded-md bg-zinc-900 text-white py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-sm text-zinc-600">
          No account?{" "}
          <a className="text-zinc-900 font-medium hover:underline" href="/register">
            Register
          </a>
        </div>
      </div>
    </div>
  );
}

