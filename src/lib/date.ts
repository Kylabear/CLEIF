export function getTodayAtMidnight(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatTime(date?: Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(date);
}
