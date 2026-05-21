"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { StatusBadge } from "@/components/StatusBadge";

type MeResponse = {
  user: {
    return (
      <>
        <button
          onClick={logout}
          className="fixed right-6 bottom-6 z-50 rounded-xl border border-slate-300/40 px-4 py-2 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 transition shadow-lg"
        >
          Logout
        </button>
        <div className="relative">
          <Shell title={`Welcome, ${name}`} subtitle="Clock in and out for the day. If you are on leave or day off, your status is already tracked automatically.">
            <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
              <section className="glass rounded-3xl p-6">
                <h2 className="font-display text-2xl text-white">Today</h2>
                <div className="mt-4 text-sm text-slate-300">Current status</div>
                <div className="mt-2"><StatusBadge label={today?.status || "LOADING"} /></div>

                {today?.schedule ? (
                  <div className="mt-4 rounded-xl border border-slate-400/25 bg-slate-900/40 p-4 text-sm text-slate-200">
                    <p>Schedule type: <strong>{today.schedule.type.replaceAll("_", " ")}</strong></p>
                    <p className="mt-1 text-slate-300">{today.schedule.note || "No note provided."}</p>
                  </div>
                ) : null}

                {error ? <p className="mt-4 rounded-lg bg-rose-500/20 px-3 py-2 text-sm text-rose-100">{error}</p> : null}

                <div className="mt-6 grid gap-3">
                  <button
                    disabled={!canTimeIn || busy}
                    onClick={() => doAction("/api/attendance/time-in")}
                    className="rounded-xl bg-teal-400 px-4 py-3 font-semibold text-slate-900 transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {busy ? "Please wait..." : "Time In"}
                  </button>
                  <button
                    disabled={!canTimeOut || busy}
                    onClick={() => doAction("/api/attendance/time-out")}
                    className="rounded-xl bg-orange-400 px-4 py-3 font-semibold text-slate-900 transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {busy ? "Please wait..." : "Time Out"}
                  </button>
                </div>
              </section>

              <section className="glass rounded-3xl p-6">
                <h2 className="font-display text-2xl text-white">Attendance Snapshot</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-400/25 bg-slate-900/40 p-4">
                    <div className="text-xs uppercase tracking-wider text-slate-400">Time In</div>
                    <div className="mt-2 text-lg font-semibold">{today?.attendance?.timeIn ? new Date(today.attendance.timeIn).toLocaleTimeString() : "-"}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-400/25 bg-slate-900/40 p-4">
                    <div className="text-xs uppercase tracking-wider text-slate-400">Time Out</div>
                    <div className="mt-2 text-lg font-semibold">{today?.attendance?.timeOut ? new Date(today.attendance.timeOut).toLocaleTimeString() : "-"}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-400/25 bg-slate-900/40 p-4">
                    <div className="text-xs uppercase tracking-wider text-slate-400">Worked Minutes</div>
                    <div className="mt-2 text-lg font-semibold">{today?.attendance?.workedMinutes ?? "-"}</div>
                  </div>
                </div>
              </section>
            </div>
          </Shell>
        </div>
      </>
    );
  }
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Request failed.");
      setBusy(false);
      return;
    }

    await fetchUserAndAttendance();
    setBusy(false);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", cache: "no-store" });
    window.location.href = "/";
  }

  return (
    <>
      <button
        onClick={logout}
        className="fixed right-6 bottom-6 z-50 rounded-xl border border-slate-300/40 px-4 py-2 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 transition shadow-lg"
      >
        Logout
      </button>
      <div className="relative">
        <Shell title={`Welcome, ${name}`} subtitle="Clock in and out for the day. If you are on leave or day off, your status is already tracked automatically.">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <section className="glass rounded-3xl p-6">
            <h2 className="font-display text-2xl text-white">Today</h2>
            <div className="mt-4 text-sm text-slate-300">Current status</div>
            <div className="mt-2"><StatusBadge label={today?.status || "LOADING"} /></div>

            {today?.schedule ? (
              <div className="mt-4 rounded-xl border border-slate-400/25 bg-slate-900/40 p-4 text-sm text-slate-200">
                <p>Schedule type: <strong>{today.schedule.type.replaceAll("_", " ")}</strong></p>
                <p className="mt-1 text-slate-300">{today.schedule.note || "No note provided."}</p>
              </div>
            ) : null}

            {error ? <p className="mt-4 rounded-lg bg-rose-500/20 px-3 py-2 text-sm text-rose-100">{error}</p> : null}

            <div className="mt-6 grid gap-3">
              <button
                disabled={!canTimeIn || busy}
                onClick={() => doAction("/api/attendance/time-in")}
                className="rounded-xl bg-teal-400 px-4 py-3 font-semibold text-slate-900 transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? "Please wait..." : "Time In"}
              </button>
              <button
                disabled={!canTimeOut || busy}
                onClick={() => doAction("/api/attendance/time-out")}
                className="rounded-xl bg-orange-400 px-4 py-3 font-semibold text-slate-900 transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? "Please wait..." : "Time Out"}
              </button>
              {/* Logout button moved to upper right */}
            </div>
          </section>

          <section className="glass rounded-3xl p-6">
            <h2 className="font-display text-2xl text-white">Attendance Snapshot</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-400/25 bg-slate-900/40 p-4">
                <div className="text-xs uppercase tracking-wider text-slate-400">Time In</div>
                <div className="mt-2 text-lg font-semibold">{today?.attendance?.timeIn ? new Date(today.attendance.timeIn).toLocaleTimeString() : "-"}</div>
              </div>
              <div className="rounded-2xl border border-slate-400/25 bg-slate-900/40 p-4">
                <div className="text-xs uppercase tracking-wider text-slate-400">Time Out</div>
                <div className="mt-2 text-lg font-semibold">{today?.attendance?.timeOut ? new Date(today.attendance.timeOut).toLocaleTimeString() : "-"}</div>
              </div>
              <div className="rounded-2xl border border-slate-400/25 bg-slate-900/40 p-4">
                <div className="text-xs uppercase tracking-wider text-slate-400">Worked Minutes</div>
                <div className="mt-2 text-lg font-semibold">{today?.attendance?.workedMinutes ?? "-"}</div>
              </div>
            </div>
          </section>
        </div>
      </Shell>
    </div>
  );
}
