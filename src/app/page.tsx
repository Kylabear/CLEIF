"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Login failed.");
      return;
    }

    if (data.user.role === "ADMIN") {
      router.push("/admin");
      return;
    }

    router.push("/employee");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8 md:px-8">
      <div className="w-full max-w-xl">
        <form onSubmit={onSubmit} className="glass glow-ring rounded-3xl p-6 md:p-8">
          <h2 className="font-display text-2xl text-white">Login</h2>
          <p className="mt-1 text-sm text-slate-300">Use your LEIF company credentials.</p>

          <label className="mt-6 block text-sm font-semibold text-slate-200">Email</label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-500/40 bg-slate-950/40 px-4 py-3 text-sm outline-none transition focus:border-teal-300"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
          />

          <label className="mt-4 block text-sm font-semibold text-slate-200">Password</label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-500/40 bg-slate-950/40 px-4 py-3 text-sm outline-none transition focus:border-teal-300"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
          />

          {error ? <p className="mt-4 rounded-lg bg-rose-500/20 px-3 py-2 text-sm text-rose-100">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-teal-400 to-orange-400 px-4 py-3 font-semibold text-slate-900 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="mt-5 text-xs text-slate-300">
            Demo: admin@leif.local / Admin@123 | staff@leif.local / Employee@123
          </div>
        </form>
      </div>
    </main>
  );
}
