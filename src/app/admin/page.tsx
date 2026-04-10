"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { StatusBadge } from "@/components/StatusBadge";

type EmployeeOption = {
  id: string;
  name: string;
  department?: string | null;
};

type ScheduleRow = {
  id: string;
  type: string;
  note?: string | null;
  employee: EmployeeOption;
};

type ManagedEmployee = {
  id: string;
  name: string;
  email: string;
  department?: string | null;
};

type DashboardResponse = {
  date: string;
  stats: {
    totalEmployees: number;
    presentCount: number;
    leaveCount: number;
    offCount: number;
    absentCount: number;
  };
  rows: {
    employee: { name: string; department?: string | null };
    attendance: { timeIn?: string | null; timeOut?: string | null; workedMinutes?: number | null } | null;
    dayStatus: string;
    scheduleType?: string | null;
    scheduleNote?: string | null;
  }[];
};

export default function AdminPage() {
  const router = useRouter();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reportFrom, setReportFrom] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  });
  const [reportTo, setReportTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
  const [managedEmployees, setManagedEmployees] = useState<ManagedEmployee[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedResetEmployeeId, setSelectedResetEmployeeId] = useState("");
  const [scheduleType, setScheduleType] = useState("DAY_OFF");
  const [scheduleNote, setScheduleNote] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [reportError, setReportError] = useState("");
  const [credentialError, setCredentialError] = useState("");
  const [credentialSuccess, setCredentialSuccess] = useState("");
  const [exportingReport, setExportingReport] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);

  async function loadDashboard(selectedDate: string) {
    setError("");

    const meRes = await fetch("/api/me", { cache: "no-store" });
    if (!meRes.ok) {
      router.push("/");
      return;
    }

    const meData = await meRes.json();
    if (meData.user.role !== "ADMIN") {
      router.push("/employee");
      return;
    }

    const response = await fetch(`/api/admin/dashboard?date=${selectedDate}`, { cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Unable to fetch dashboard");
      return;
    }

    setDashboard(data);

    const scheduleRes = await fetch(`/api/admin/schedule?date=${selectedDate}`, { cache: "no-store" });
    const scheduleData = await scheduleRes.json();

    if (scheduleRes.ok) {
      setEmployeeOptions(scheduleData.employees);
      setSchedules(scheduleData.schedules);
      if (!selectedEmployeeId && scheduleData.employees.length > 0) {
        setSelectedEmployeeId(scheduleData.employees[0].id);
      }
    }

    const employeeRes = await fetch("/api/admin/employees", { cache: "no-store" });
    const employeeData = await employeeRes.json().catch(() => ({ employees: [] }));

    if (employeeRes.ok) {
      setManagedEmployees(employeeData.employees ?? []);
      if (!selectedResetEmployeeId && (employeeData.employees?.length ?? 0) > 0) {
        setSelectedResetEmployeeId(employeeData.employees[0].id);
      }
    }
  }

  useEffect(() => {
    loadDashboard(date);
  }, [date]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", cache: "no-store" });
    window.location.href = "/";
  }

  async function submitSchedule() {
    if (!selectedEmployeeId) {
      setScheduleError("Please select an employee.");
      return;
    }

    setSavingSchedule(true);
    setScheduleError("");

    const response = await fetch("/api/admin/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: selectedEmployeeId,
        type: scheduleType,
        date,
        note: scheduleNote
      })
    });

    const data = await response.json();
    setSavingSchedule(false);

    if (!response.ok) {
      setScheduleError(data.error || "Unable to save schedule.");
      return;
    }

    setScheduleNote("");
    await loadDashboard(date);
  }

  async function exportPayrollReport() {
    setReportError("");

    if (!reportFrom || !reportTo) {
      setReportError("Please provide both From and To dates.");
      return;
    }

    setExportingReport(true);

    const response = await fetch(`/api/admin/reports/payroll?from=${reportFrom}&to=${reportTo}`);

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setReportError(payload.error || "Unable to export payroll report.");
      setExportingReport(false);
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `payroll-attendance-${reportFrom}-to-${reportTo}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);

    setExportingReport(false);
  }

  async function resetEmployeePassword() {
    setCredentialError("");
    setCredentialSuccess("");

    if (!selectedResetEmployeeId) {
      setCredentialError("Please select an employee account.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setCredentialError("New password must be at least 8 characters.");
      return;
    }

    setResettingPassword(true);

    const response = await fetch("/api/admin/employees/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: selectedResetEmployeeId,
        newPassword
      })
    });

    const payload = await response.json().catch(() => ({}));
    setResettingPassword(false);

    if (!response.ok) {
      setCredentialError(payload.error || "Failed to reset password.");
      return;
    }

    const selectedEmployee = managedEmployees.find((item) => item.id === selectedResetEmployeeId);
    setCredentialSuccess(`Password updated for ${selectedEmployee?.name || "employee"}.`);
    setNewPassword("");
  }

  const cards = useMemo(() => {
    if (!dashboard) return [];
    return [
      { label: "Employees", value: dashboard.stats.totalEmployees },
      { label: "Present / Late", value: dashboard.stats.presentCount },
      { label: "On Leave", value: dashboard.stats.leaveCount },
      { label: "Day Off", value: dashboard.stats.offCount },
      { label: "Absent", value: dashboard.stats.absentCount }
    ];
  }, [dashboard]);

  return (
    <Shell
      title="Admin Dashboard"
      subtitle="Monitor attendance records and leave/day-off schedules by date, without forcing off-day staff to submit attendance."
    >
      <div className="grid gap-6">
        <section className="glass rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl text-white">Daily Overview</h2>
              <p className="text-sm text-slate-300">Choose a date to review attendance and off-day coverage.</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Select dashboard date"
                title="Select dashboard date"
                className="rounded-xl border border-slate-400/40 bg-slate-900/40 px-4 py-2 text-sm"
              />
              <button onClick={logout} className="rounded-xl border border-slate-300/40 px-4 py-2 text-sm font-semibold text-slate-100">
                Logout
              </button>
            </div>
          </div>

          {error ? <p className="mt-4 rounded-lg bg-rose-500/20 px-3 py-2 text-sm text-rose-100">{error}</p> : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => (
              <article key={card.label} className="rounded-2xl border border-slate-400/25 bg-slate-900/40 p-4">
                <div className="text-xs uppercase tracking-wider text-slate-400">{card.label}</div>
                <div className="mt-2 font-display text-3xl font-semibold text-white">{card.value}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="glass rounded-3xl p-4 md:p-6">
          <h3 className="font-display text-xl text-white">Employee Status Table</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-sm text-slate-200">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-3 py-2">Employee</th>
                  <th className="px-3 py-2">Department</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">In</th>
                  <th className="px-3 py-2">Out</th>
                  <th className="px-3 py-2">Worked</th>
                  <th className="px-3 py-2">Schedule Note</th>
                </tr>
              </thead>
              <tbody>
                {dashboard?.rows.map((row) => (
                  <tr key={row.employee.name} className="rounded-xl bg-slate-900/35">
                    <td className="px-3 py-3 font-semibold text-white">{row.employee.name}</td>
                    <td className="px-3 py-3">{row.employee.department || "-"}</td>
                    <td className="px-3 py-3"><StatusBadge label={row.dayStatus} /></td>
                    <td className="px-3 py-3">{row.attendance?.timeIn ? new Date(row.attendance.timeIn).toLocaleTimeString() : "-"}</td>
                    <td className="px-3 py-3">{row.attendance?.timeOut ? new Date(row.attendance.timeOut).toLocaleTimeString() : "-"}</td>
                    <td className="px-3 py-3">{row.attendance?.workedMinutes ?? "-"}</td>
                    <td className="px-3 py-3 text-slate-300">{row.scheduleNote || row.scheduleType?.replaceAll("_", " ") || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass rounded-3xl p-6">
          <h3 className="font-display text-xl text-white">Day-Off / Leave Planner</h3>
          <p className="mt-1 text-sm text-slate-300">Add or update a schedule item for the selected date. Existing entries for the same employee/date are updated.</p>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              aria-label="Select employee"
              title="Select employee"
              className="rounded-xl border border-slate-400/40 bg-slate-900/40 px-3 py-2 text-sm"
            >
              {employeeOptions.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>

            <select
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value)}
              aria-label="Select schedule type"
              title="Select schedule type"
              className="rounded-xl border border-slate-400/40 bg-slate-900/40 px-3 py-2 text-sm"
            >
              <option value="DAY_OFF">Day Off</option>
              <option value="LEAVE">Leave</option>
              <option value="SICK">Sick</option>
              <option value="HOLIDAY">Holiday</option>
            </select>

            <input
              value={scheduleNote}
              onChange={(e) => setScheduleNote(e.target.value)}
              placeholder="Optional note"
              className="rounded-xl border border-slate-400/40 bg-slate-900/40 px-3 py-2 text-sm"
            />

            <button
              onClick={submitSchedule}
              disabled={savingSchedule}
              className="rounded-xl bg-gradient-to-r from-teal-400 to-orange-400 px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {savingSchedule ? "Saving..." : "Save Schedule"}
            </button>
          </div>

          {scheduleError ? <p className="mt-3 rounded-lg bg-rose-500/20 px-3 py-2 text-sm text-rose-100">{scheduleError}</p> : null}

          <div className="mt-5 grid gap-2">
            {schedules.length === 0 ? (
              <p className="text-sm text-slate-300">No schedule items for this date.</p>
            ) : (
              schedules.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-400/25 bg-slate-900/35 px-4 py-3 text-sm">
                  <span className="font-semibold text-white">{item.employee.name}</span>
                  <StatusBadge label={item.type} />
                  <span className="text-slate-300">{item.note || "No note"}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="glass rounded-3xl p-6">
          <h3 className="font-display text-xl text-white">Payroll Report Export</h3>
          <p className="mt-1 text-sm text-slate-300">Download payroll-ready attendance CSV with worked hours, overtime, leave, day-off, and absence totals per employee.</p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <input
              type="date"
              value={reportFrom}
              onChange={(e) => setReportFrom(e.target.value)}
              aria-label="Payroll report start date"
              title="Payroll report start date"
              className="rounded-xl border border-slate-400/40 bg-slate-900/40 px-4 py-2 text-sm"
            />
            <input
              type="date"
              value={reportTo}
              onChange={(e) => setReportTo(e.target.value)}
              aria-label="Payroll report end date"
              title="Payroll report end date"
              className="rounded-xl border border-slate-400/40 bg-slate-900/40 px-4 py-2 text-sm"
            />
            <button
              onClick={exportPayrollReport}
              disabled={exportingReport}
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-orange-400 px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {exportingReport ? "Exporting..." : "Export CSV"}
            </button>
          </div>

          {reportError ? <p className="mt-3 rounded-lg bg-rose-500/20 px-3 py-2 text-sm text-rose-100">{reportError}</p> : null}
        </section>

        <section className="glass rounded-3xl p-6">
          <h3 className="font-display text-xl text-white">Employee Credentials</h3>
          <p className="mt-1 text-sm text-slate-300">View employee usernames and reset any employee password individually.</p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <select
              value={selectedResetEmployeeId}
              onChange={(e) => setSelectedResetEmployeeId(e.target.value)}
              aria-label="Select employee account"
              title="Select employee account"
              className="rounded-xl border border-slate-400/40 bg-slate-900/40 px-3 py-2 text-sm"
            >
              {managedEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New temporary password"
              aria-label="New temporary password"
              title="New temporary password"
              className="rounded-xl border border-slate-400/40 bg-slate-900/40 px-4 py-2 text-sm"
            />

            <button
              onClick={resetEmployeePassword}
              disabled={resettingPassword}
              className="rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {resettingPassword ? "Updating..." : "Reset Password"}
            </button>
          </div>

          {credentialError ? <p className="mt-3 rounded-lg bg-rose-500/20 px-3 py-2 text-sm text-rose-100">{credentialError}</p> : null}
          {credentialSuccess ? <p className="mt-3 rounded-lg bg-emerald-500/20 px-3 py-2 text-sm text-emerald-100">{credentialSuccess}</p> : null}

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-sm text-slate-200">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Username</th>
                  <th className="px-3 py-2">Department</th>
                </tr>
              </thead>
              <tbody>
                {managedEmployees.map((employee) => (
                  <tr key={employee.id} className="rounded-xl bg-slate-900/35">
                    <td className="px-3 py-3 font-semibold text-white">{employee.name}</td>
                    <td className="px-3 py-3 text-slate-200">{employee.email}</td>
                    <td className="px-3 py-3 text-slate-300">{employee.department || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Shell>
  );
}
