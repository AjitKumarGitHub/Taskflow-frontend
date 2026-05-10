"use client";

import { useMemo, useState } from "react";
import { apiRegister } from "@/lib/api-client";

import { useRouter } from "next/navigation";

 
function Field({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");


  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => name.trim().length > 0 && email.trim().length > 0 && password.length >= 4,
    [name, email, password]
  );


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await apiRegister({
        name,
        email,
        password,
        role: role === "ADMIN" ? "admin" : "user",
      });
      setSuccess("Account created. Redirecting...");

      setTimeout(() => router.push("/dashboard"), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-zinc-200 p-6">
        <h1 className="text-2xl font-semibold  text-green-600">Register</h1>
        <p className="text-sm text-zinc-600 mt-1">Create an account to manage tasks.</p>


        {error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}
        {success ? (
          <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-5 space-y-4 text-slate-500">
          <Field label="Name" value={name} onChange={setName} />
          
          <Field label="Email" value={email} onChange={setEmail} type="email" />
          <Field label="Password" value={password} onChange={setPassword} type="password" />
          {/* <Field
            label="Role (user or admin)"
            value={role}
            onChange={setRole}
          /> */}

          <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-slate-600">
      Role
    </label>

    <select
      value={role}
      onChange={(e) => setRole(e.target.value)}
      className="border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="USER">USER</option>
      <option value="ADMIN">ADMIN</option>
    </select>
  </div>
          <button
            disabled={!canSubmit || loading}
            className="w-full rounded-md bg-zinc-900 text-white py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="mt-4 text-sm text-zinc-600">
          Already have an account?{" "}
          <a className="text-zinc-900 text-red-400 font-medium hover:underline" href="/login">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}

