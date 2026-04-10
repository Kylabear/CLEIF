type BadgeProps = {
  label: string;
};

const styles: Record<string, string> = {
  PRESENT: "bg-emerald-500/25 text-emerald-200 border-emerald-300/40",
  LATE: "bg-amber-500/25 text-amber-100 border-amber-300/40",
  ABSENT: "bg-rose-500/25 text-rose-100 border-rose-300/40",
  ON_LEAVE: "bg-sky-500/25 text-sky-100 border-sky-300/40",
  OFF: "bg-violet-500/25 text-violet-100 border-violet-300/40",
  DAY_OFF: "bg-violet-500/25 text-violet-100 border-violet-300/40",
  HOLIDAY: "bg-indigo-500/25 text-indigo-100 border-indigo-300/40",
  SICK: "bg-cyan-500/25 text-cyan-100 border-cyan-300/40"
};

export function StatusBadge({ label }: BadgeProps) {
  const style = styles[label] ?? "bg-slate-500/25 text-slate-100 border-slate-300/30";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${style}`}>
      {label.replaceAll("_", " ")}
    </span>
  );
}
