import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

const AUTH_COOKIE_NAME = "taskflow_jwt";

export default function Home() {
  const store = cookies();
  return store.then((c) => {
    const token = c.get(AUTH_COOKIE_NAME)?.value;
    if (token) redirect("/dashboard");

    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-xl border border-zinc-200 p-6 backdrop-blur-sm shadow-lg">
          <h1 className="text-3xl font-semibold text-slate-600">TaskFlow</h1>
          <p className="text-md text-zinc-600 mt-2">Register or login to manage tasks with CRUD.</p>

          <div className="mt-5 flex gap-3">
            <Link
              href="/login"
              className="flex-1 text-center rounded-md bg-zinc-900 text-white py-2 text-sm font-medium hover:bg-pink-500 hover:text-white-900"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="flex-1 text-center rounded-md border border-zinc-300 bg-zinc-900 py-2 text-sm font-medium hover:bg-pink-500 hover:text-white-900"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  });
}


